import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useCurrentUser } from "./use-current-user";
import type { ContactStage } from "./use-contacts";

export type ResellerTier = "bronze" | "silver" | "gold";

export type PipelineDeal = {
  contact_id: string;
  contact_name: string;
  stage: ContactStage;
  deal_value: number | null;
};

export type Reseller = {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  owner_user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  confidence_level: number | null;
  archived_at: string | null;
  created_at: string;
  dealsCount: number;
  revenue: number;
  pipeline: PipelineDeal[];
};

export function tierFor(revenue: number): ResellerTier {
  if (revenue > 500_000) return "gold";
  if (revenue >= 100_000) return "silver";
  return "bronze";
}

const SELECT =
  "*, reseller_contacts(contact_id, contacts(id, contact_name, stage, subscription_details(deal_value)))";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Reseller {
  const links = (row.reseller_contacts ?? []) as Array<{
    contact_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contacts: any;
  }>;
  const pipeline: PipelineDeal[] = links
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

export function useResellers() {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResellers = useCallback(async (organizationId: string | null) => {
    let query = supabase
      .from("resellers")
      .select(SELECT)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data } = await query;
    return (data ?? []).map(mapRow);
  }, []);

  useEffect(() => {
    if (!user) {
      setResellers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const organizationId = current.id === "all" ? null : current.id;
    fetchResellers(organizationId).then((rows) => {
      if (!cancelled) {
        setResellers(rows);
        setLoading(false);
      }
    });

    const channel = supabase
      .channel(`resellers-${organizationId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resellers",
          ...(organizationId ? { filter: `organization_id=eq.${organizationId}` } : {}),
        },
        () => {
          fetchResellers(organizationId).then((rows) => {
            if (!cancelled) setResellers(rows);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, current.id, fetchResellers]);

  const createReseller = useCallback(
    async (data: {
      name: string;
      company?: string | null;
      email?: string | null;
      phone?: string | null;
    }) => {
      if (!user || current.id === "all") return null;
      const { data: created, error } = await supabase
        .from("resellers")
        .insert({
          organization_id: current.id,
          created_by_user_id: user.id,
          owner_user_id: user.id,
          name: data.name,
          company: data.company ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
        })
        .select(SELECT)
        .single();
      if (error) throw error;
      const row = created ? mapRow(created) : null;
      if (row) setResellers((prev) => [row, ...prev]);
      return row;
    },
    [user, current.id],
  );

  return { resellers, loading, createReseller };
}
