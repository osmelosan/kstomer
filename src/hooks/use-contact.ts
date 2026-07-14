import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Contact } from "./use-contacts";

export type ContactNote = {
  id: string;
  organization_id: string;
  contact_id: string;
  note_text: string;
  created_at: string;
  updated_at: string | null;
};

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<ContactNote[]>([]);
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
      const { data: noteRows } = await supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: false });
      setNotes((noteRows ?? []) as ContactNote[]);
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
          | "contact_name"
          | "first_name"
          | "last_name"
          | "company_name"
          | "email"
          | "phone"
          | "stage"
          | "confidence_level"
          | "renewal_date"
        >
      >,
    ) => {
      const { data } = await supabase.from("contacts").update(patch).eq("id", id).select().single();
      if (data) setContact((prev) => (prev ? { ...prev, ...data } : (data as Contact)));
      return data as Contact | null;
    },
    [id],
  );

  const addNote = useCallback(
    async (text: string) => {
      if (!contact || !text.trim()) return;
      const { data: created } = await supabase
        .from("contact_notes")
        .insert({
          organization_id: contact.organization_id,
          contact_id: contact.id,
          note_text: text.trim(),
        })
        .select()
        .single();
      if (created) {
        setNotes((prev) => [created as ContactNote, ...prev]);
        await supabase
          .from("contacts")
          .update({ notes_count: contact.notes_count + 1 })
          .eq("id", contact.id);
        setContact((prev) => (prev ? { ...prev, notes_count: prev.notes_count + 1 } : prev));
      }
    },
    [contact],
  );

  const updateNote = useCallback(async (noteId: string, text: string) => {
    if (!text.trim()) return;
    const { data: updated } = await supabase
      .from("contact_notes")
      .update({ note_text: text.trim(), updated_at: new Date().toISOString() })
      .eq("id", noteId)
      .select()
      .single();
    if (updated) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? (updated as ContactNote) : n)));
    }
  }, []);

  const archiveContact = useCallback(async () => {
    await supabase.from("contacts").update({ archived_at: new Date().toISOString() }).eq("id", id);
  }, [id]);

  const deleteContact = useCallback(async () => {
    await supabase.from("contacts").delete().eq("id", id);
  }, [id]);

  return {
    contact,
    notes,
    loading,
    updateContact,
    addNote,
    updateNote,
    archiveContact,
    deleteContact,
  };
}
