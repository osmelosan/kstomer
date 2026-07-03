import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./use-current-user";
import type { Reseller } from "./use-resellers";

// Re-fetches with the same shape use-resellers.ts uses, kept in this file
// too so a single-reseller fetch doesn't depend on the list hook's state.
const SELECT =
  "*, reseller_contacts(contact_id, contacts(id, contact_name, stage, subscription_details(deal_value)))";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Reseller {
  const links = (row.reseller_contacts ?? []) as Array<{
    contact_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contacts: any;
  }>;
  const pipeline = links
    .filter((l) => l.contacts)
    .map((l) => ({
      contact_id: l.contact_id,
      contact_name: l.contacts.contact_name,
      stage: l.contacts.stage,
      deal_value: l.contacts.subscription_details?.deal_value ?? null,
    }));
  const revenue = pipeline.reduce((sum, d) => sum + (d.deal_value ?? 0), 0);
  return {
    id: row.id,
    organization_id: row.organization_id,
    created_by_user_id: row.created_by_user_id,
    owner_user_id: row.owner_user_id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    confidence_level: row.confidence_level,
    archived_at: row.archived_at,
    created_at: row.created_at,
    dealsCount: pipeline.length,
    revenue,
    pipeline,
  };
}

export type NoteVersion = { id: string; previous_text: string; edited_at: string };
type NoteRow = { id: string; note_text: string; edited: boolean };

export function useReseller(id: string) {
  const { user } = useCurrentUser();
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [note, setNote] = useState<NoteRow | null>(null);
  const [noteHistory, setNoteHistory] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: row } = await supabase
      .from("resellers")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    const mapped = row ? mapRow(row) : null;
    setReseller(mapped);

    if (mapped) {
      const { data: noteRow } = await supabase
        .from("notes")
        .select("*")
        .eq("reseller_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setNote(noteRow as NoteRow | null);
      if (noteRow) {
        const { data: history } = await supabase
          .from("note_edit_history")
          .select("*")
          .eq("note_id", noteRow.id)
          .order("edited_at", { ascending: false });
        setNoteHistory((history ?? []) as NoteVersion[]);
      } else {
        setNoteHistory([]);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateReseller = useCallback(
    async (
      patch: Partial<Pick<Reseller, "name" | "company" | "email" | "phone" | "confidence_level">>,
    ) => {
      const { data } = await supabase
        .from("resellers")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (data) setReseller((prev) => (prev ? { ...prev, ...data } : prev));
      return data;
    },
    [id],
  );

  const saveNote = useCallback(
    async (text: string) => {
      if (!reseller) return;
      if (note) {
        if (note.note_text === text) return;
        await supabase
          .from("note_edit_history")
          .insert({ note_id: note.id, previous_text: note.note_text });
        const { data: updated } = await supabase
          .from("notes")
          .update({ note_text: text, edited: true, updated_at: new Date().toISOString() })
          .eq("id", note.id)
          .select()
          .single();
        if (updated) setNote(updated as NoteRow);
        setNoteHistory((prev) => [
          {
            id: crypto.randomUUID(),
            previous_text: note.note_text,
            edited_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        if (!text.trim()) return;
        const { data: created } = await supabase
          .from("notes")
          .insert({
            organization_id: reseller.organization_id,
            reseller_id: reseller.id,
            note_text: text,
          })
          .select()
          .single();
        if (created) setNote(created as NoteRow);
      }
    },
    [reseller, note],
  );

  const restoreVersion = useCallback(
    async (version: NoteVersion) => {
      await saveNote(version.previous_text);
      setNoteHistory((prev) => prev.filter((v) => v.id !== version.id));
    },
    [saveNote],
  );

  const linkContact = useCallback(
    async (contactId: string) => {
      if (!reseller) return { error: null as string | null };
      const { error } = await supabase.from("reseller_contacts").insert({
        reseller_id: reseller.id,
        contact_id: contactId,
        organization_id: reseller.organization_id,
      });
      if (error) {
        return { error: error.code === "23505" ? "already_linked" : "unknown" };
      }
      await supabase.from("reseller_contact_history").insert({
        reseller_id: reseller.id,
        contact_id: contactId,
        organization_id: reseller.organization_id,
        started_at: new Date().toISOString(),
      });
      await load();
      return { error: null };
    },
    [reseller, load],
  );

  const unlinkContact = useCallback(
    async (contactId: string) => {
      if (!reseller) return;
      await supabase
        .from("reseller_contacts")
        .delete()
        .eq("reseller_id", reseller.id)
        .eq("contact_id", contactId);
      await supabase
        .from("reseller_contact_history")
        .update({ ended_at: new Date().toISOString() })
        .eq("reseller_id", reseller.id)
        .eq("contact_id", contactId)
        .is("ended_at", null);
      await load();
    },
    [reseller, load],
  );

  return {
    reseller,
    note,
    noteHistory,
    loading,
    updateReseller,
    saveNote,
    restoreVersion,
    linkContact,
    unlinkContact,
    currentUserId: user?.id ?? null,
  };
}
