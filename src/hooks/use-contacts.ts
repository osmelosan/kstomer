import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useCurrentUser } from "./use-current-user";

export type ContactStage = "new_lead" | "contacted" | "proposal" | "active" | "at_risk";

export type Contact = {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  owner_user_id: string;
  contact_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  stage: ContactStage;
  confidence_level: number | null;
  notes_count: number;
  renewal_date: string | null;
  last_contact_date: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useContacts() {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async (organizationId: string | null) => {
    let query = supabase
      .from("contacts")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data } = await query;
    return (data ?? []) as Contact[];
  }, []);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchContacts(current.id === "all" ? null : current.id).then((rows) => {
      if (!cancelled) {
        setContacts(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, current.id, fetchContacts]);

  const createContact = useCallback(
    async (data: {
      contact_name: string;
      company_name?: string | null;
      email?: string | null;
      phone?: string | null;
      stage?: ContactStage;
    }) => {
      if (!user || current.id === "all") return null;
      const { data: created, error } = await supabase
        .from("contacts")
        .insert({
          organization_id: current.id,
          created_by_user_id: user.id,
          owner_user_id: user.id,
          contact_name: data.contact_name,
          company_name: data.company_name ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          stage: data.stage ?? "new_lead",
        })
        .select()
        .single();
      if (error) throw error;
      if (created) setContacts((prev) => [created as Contact, ...prev]);
      return created as Contact | null;
    },
    [user, current.id],
  );

  const updateContact = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          Contact,
          | "contact_name"
          | "company_name"
          | "email"
          | "phone"
          | "stage"
          | "confidence_level"
          | "renewal_date"
          | "last_contact_date"
          | "archived_at"
        >
      >,
    ) => {
      const { data } = await supabase.from("contacts").update(patch).eq("id", id).select().single();
      if (data) setContacts((prev) => prev.map((c) => (c.id === id ? (data as Contact) : c)));
      return data as Contact | null;
    },
    [],
  );

  return { contacts, loading, createContact, updateContact };
}
