import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { joinContactName } from "@/lib/contact-name";
import { useCurrentUser } from "./use-current-user";

export type ContactStage = "new_lead" | "contacted" | "proposal" | "active" | "at_risk";

export type SubscriptionDetails = {
  id: string;
  deal_value: number | null;
  mrr: number | null;
  plan_name: string | null;
};

export type Contact = {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  owner_user_id: string;
  contact_name: string;
  first_name: string;
  last_name: string | null;
  company_name: string | null;
  cargo: string | null;
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
  subscription_details: SubscriptionDetails | null;
};

const SELECT = "*, subscription_details(id, deal_value, mrr, plan_name)";

export function useContacts() {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async (organizationId: string | null) => {
    let query = supabase
      .from("contacts")
      .select(SELECT)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data } = await query;
    return (data ?? []) as unknown as Contact[];
  }, []);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const organizationId = current.id === "all" ? null : current.id;
    fetchContacts(organizationId).then((rows) => {
      if (!cancelled) {
        setContacts(rows);
        setLoading(false);
      }
    });

    // Suffixed with a unique id so concurrent useContacts() instances (e.g. a
    // page and MobileQuickActions mounted at once) each get their own
    // channel — Supabase reuses a channel by exact topic name, and adding a
    // postgres_changes listener to one that's already subscribed throws.
    const channel = supabase
      .channel(`contacts-${organizationId ?? "all"}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
          ...(organizationId ? { filter: `organization_id=eq.${organizationId}` } : {}),
        },
        () => {
          fetchContacts(organizationId).then((rows) => {
            if (!cancelled) setContacts(rows);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, current.id, fetchContacts]);

  const createContact = useCallback(
    async (data: {
      first_name: string;
      last_name?: string | null;
      company_name?: string | null;
      cargo?: string | null;
      email?: string | null;
      phone?: string | null;
      stage?: ContactStage;
      confidence_level?: number | null;
    }) => {
      if (!user || current.id === "all") return null;
      const { data: created, error } = await supabase
        .from("contacts")
        .insert({
          organization_id: current.id,
          created_by_user_id: user.id,
          owner_user_id: user.id,
          first_name: data.first_name,
          last_name: data.last_name ?? null,
          contact_name: joinContactName(data.first_name, data.last_name),
          company_name: data.company_name ?? null,
          cargo: data.cargo ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          stage: data.stage ?? "new_lead",
          confidence_level: data.confidence_level ?? null,
        })
        .select(SELECT)
        .single();
      if (error) throw error;
      const row = created as unknown as Contact | null;
      if (row) setContacts((prev) => [row, ...prev]);
      return row;
    },
    [user, current.id],
  );

  const importContacts = useCallback(
    async (
      rows: {
        first_name: string;
        last_name: string | null;
        company_name: string | null;
        email: string | null;
        phone: string | null;
        stage: ContactStage;
        renewal_date: string | null;
        last_contact_date: string | null;
      }[],
    ): Promise<{ imported: number; skipped: number }> => {
      if (!user || current.id === "all" || rows.length === 0) {
        return { imported: 0, skipped: rows.length };
      }
      const payload = rows.map((r) => ({
        organization_id: current.id,
        created_by_user_id: user.id,
        owner_user_id: user.id,
        first_name: r.first_name,
        last_name: r.last_name,
        contact_name: joinContactName(r.first_name, r.last_name),
        company_name: r.company_name,
        email: r.email,
        phone: r.phone,
        stage: r.stage,
        renewal_date: r.renewal_date,
        last_contact_date: r.last_contact_date,
      }));
      const { data, error } = await supabase
        .from("contacts")
        .upsert(payload, { onConflict: "organization_id,email", ignoreDuplicates: true })
        .select(SELECT);
      if (error) throw error;
      const inserted = (data ?? []) as unknown as Contact[];
      setContacts((prev) => [...inserted, ...prev]);
      return { imported: inserted.length, skipped: rows.length - inserted.length };
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
          | "first_name"
          | "last_name"
          | "company_name"
          | "cargo"
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
      const { data } = await supabase
        .from("contacts")
        .update(patch)
        .eq("id", id)
        .select(SELECT)
        .single();
      const row = data as unknown as Contact | null;
      if (row) setContacts((prev) => prev.map((c) => (c.id === id ? row : c)));
      return row;
    },
    [],
  );

  // Changes a contact's pipeline stage and logs the transition to
  // stage_history, matching what getPipelineSummaryTool/dashboard AI
  // insights already expect from real board activity.
  const changeStage = useCallback(
    async (id: string, toStage: ContactStage) => {
      const current = contacts.find((c) => c.id === id);
      if (!current || current.stage === toStage) return null;
      const updated = await updateContact(id, { stage: toStage });
      if (updated) {
        await supabase.from("stage_history").insert({
          contact_id: id,
          organization_id: updated.organization_id,
          from_stage: current.stage,
          to_stage: toStage,
          changed_by_user_id: user?.id ?? null,
        });
      }
      return updated;
    },
    [contacts, updateContact, user],
  );

  const upsertDealValue = useCallback(
    async (contactId: string, organizationId: string, dealValue: number | null) => {
      const { data } = await supabase
        .from("subscription_details")
        .upsert(
          { contact_id: contactId, organization_id: organizationId, deal_value: dealValue },
          { onConflict: "contact_id" },
        )
        .select("id, deal_value, mrr, plan_name")
        .single();
      const row = data as SubscriptionDetails | null;
      if (row) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, subscription_details: row } : c)),
        );
      }
      return row;
    },
    [],
  );

  const archiveContact = useCallback(async (id: string) => {
    await supabase.from("contacts").update({ archived_at: new Date().toISOString() }).eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    contacts,
    loading,
    createContact,
    importContacts,
    updateContact,
    changeStage,
    upsertDealValue,
    archiveContact,
  };
}
