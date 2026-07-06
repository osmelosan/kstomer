import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Contact } from "./use-contacts";

export type NoteVersion = {
  id: string;
  previous_text: string;
  edited_at: string;
};

type NoteRow = {
  id: string;
  organization_id: string;
  contact_id: string;
  note_text: string;
  edited: boolean;
  created_at: string;
  updated_at: string | null;
};

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [note, setNote] = useState<NoteRow | null>(null);
  const [noteHistory, setNoteHistory] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: contactRow } = await supabase
      .from("contacts")
      .select("*, subscription_details(id, deal_value, mrr, plan_name)")
      .eq("id", id)
      .maybeSingle();
    setContact(contactRow as Contact | null);

    if (contactRow) {
      const { data: noteRow } = await supabase
        .from("notes")
        .select("*")
        .eq("contact_id", id)
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
    let cancelled = false;
    load().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateContact = useCallback(
    async (
      patch: Partial<
        Pick<
          Contact,
          "contact_name" | "company_name" | "email" | "phone" | "stage" | "confidence_level"
        >
      >,
    ) => {
      const { data } = await supabase.from("contacts").update(patch).eq("id", id).select().single();
      if (data) setContact((prev) => (prev ? { ...prev, ...data } : (data as Contact)));
      return data as Contact | null;
    },
    [id],
  );

  const saveNote = useCallback(
    async (text: string) => {
      if (!contact) return;
      if (note) {
        if (note.note_text === text) return;
        await supabase.from("note_edit_history").insert({
          note_id: note.id,
          previous_text: note.note_text,
        });
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
            organization_id: contact.organization_id,
            contact_id: contact.id,
            note_text: text,
          })
          .select()
          .single();
        if (created) {
          setNote(created as NoteRow);
          await supabase
            .from("contacts")
            .update({ notes_count: contact.notes_count + 1 })
            .eq("id", contact.id);
          setContact((prev) => (prev ? { ...prev, notes_count: prev.notes_count + 1 } : prev));
        }
      }
    },
    [contact, note],
  );

  const restoreVersion = useCallback(
    async (version: NoteVersion) => {
      await saveNote(version.previous_text);
      setNoteHistory((prev) => prev.filter((v) => v.id !== version.id));
    },
    [saveNote],
  );

  const archiveContact = useCallback(async () => {
    await supabase.from("contacts").update({ archived_at: new Date().toISOString() }).eq("id", id);
  }, [id]);

  const deleteContact = useCallback(async () => {
    await supabase.from("contacts").delete().eq("id", id);
  }, [id]);

  return {
    contact,
    note,
    noteHistory,
    loading,
    updateContact,
    saveNote,
    restoreVersion,
    archiveContact,
    deleteContact,
  };
}
