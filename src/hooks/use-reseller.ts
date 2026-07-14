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

export type ResellerNote = {
  id: string;
  organization_id: string;
  reseller_id: string;
  note_text: string;
  created_at: string;
  updated_at: string | null;
};

export function useReseller(id: string) {
  const { user } = useCurrentUser();
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [notes, setNotes] = useState<ResellerNote[]>([]);
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
      const { data: noteRows } = await supabase
        .from("reseller_notes")
        .select("*")
        .eq("reseller_id", id)
        .order("created_at", { ascending: false });
      setNotes((noteRows ?? []) as ResellerNote[]);
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

  const addNote = useCallback(
    async (text: string) => {
      if (!reseller || !text.trim()) return;
      const { data: created } = await supabase
        .from("reseller_notes")
        .insert({
          organization_id: reseller.organization_id,
          reseller_id: reseller.id,
          note_text: text.trim(),
        })
        .select()
        .single();
      if (created) setNotes((prev) => [created as ResellerNote, ...prev]);
    },
    [reseller],
  );

  const updateNote = useCallback(async (noteId: string, text: string) => {
    if (!text.trim()) return;
    const { data: updated } = await supabase
      .from("reseller_notes")
      .update({ note_text: text.trim(), updated_at: new Date().toISOString() })
      .eq("id", noteId)
      .select()
      .single();
    if (updated) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? (updated as ResellerNote) : n)));
    }
  }, []);

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

  const archiveReseller = useCallback(async () => {
    await supabase.from("resellers").update({ archived_at: new Date().toISOString() }).eq("id", id);
  }, [id]);

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
    notes,
    loading,
    updateReseller,
    addNote,
    updateNote,
    linkContact,
    unlinkContact,
    archiveReseller,
    currentUserId: user?.id ?? null,
  };
}
