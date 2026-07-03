import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnalyticsPeriod = { from: Date; to: Date };

export type AnalyticsData = {
  totalRevenue: number;
  conversionRate: number;
  activeContacts: number;
  pipelineValue: number;
  revenueByMonth: { month: string; value: number }[];
  renewalsNext30: { count: number; valueAtRisk: number };
};

const EMPTY: AnalyticsData = {
  totalRevenue: 0,
  conversionRate: 0,
  activeContacts: 0,
  pipelineValue: 0,
  revenueByMonth: [],
  renewalsNext30: { count: 0, valueAtRisk: 0 },
};

type ContactRow = {
  id: string;
  stage: string;
  confidence_level: number | null;
  created_at: string;
  last_contact_date: string | null;
  renewal_date: string | null;
  archived_at: string | null;
  subscription_details: { deal_value: number | null } | null;
};

export function useAnalytics(organizationId: string | null, period: AnalyticsPeriod) {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("contacts")
      .select(
        "id, stage, confidence_level, created_at, last_contact_date, renewal_date, archived_at, subscription_details(deal_value)",
      )
      .is("archived_at", null)
      .gte("created_at", period.from.toISOString())
      .lte("created_at", period.to.toISOString());
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data: rows } = await query;
    const contacts = (rows ?? []) as unknown as ContactRow[];

    const active = contacts.filter((c) => c.stage === "active");
    const totalRevenue = active.reduce(
      (sum, c) => sum + (c.subscription_details?.deal_value ?? 0),
      0,
    );
    const conversionRate = contacts.length > 0 ? (active.length / contacts.length) * 100 : 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeContacts = contacts.filter(
      (c) => c.last_contact_date && new Date(c.last_contact_date) >= thirtyDaysAgo,
    ).length;

    const openStages = new Set(["new_lead", "contacted", "proposal", "at_risk"]);
    const pipelineValue = contacts
      .filter((c) => openStages.has(c.stage))
      .reduce(
        (sum, c) =>
          sum + (c.subscription_details?.deal_value ?? 0) * ((c.confidence_level ?? 0) / 5),
        0,
      );

    const monthBuckets = new Map<string, number>();
    active.forEach((c) => {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthBuckets.set(
        key,
        (monthBuckets.get(key) ?? 0) + (c.subscription_details?.deal_value ?? 0),
      );
    });
    const revenueByMonth = Array.from(monthBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));

    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    let renewalsQuery = supabase
      .from("contacts")
      .select("renewal_date, subscription_details(deal_value)")
      .is("archived_at", null)
      .not("renewal_date", "is", null)
      .gte("renewal_date", now.toISOString().slice(0, 10))
      .lte("renewal_date", in30Days.toISOString().slice(0, 10));
    if (organizationId) renewalsQuery = renewalsQuery.eq("organization_id", organizationId);
    const { data: renewalRows } = await renewalsQuery;
    const renewals = (renewalRows ?? []) as unknown as {
      subscription_details: { deal_value: number | null } | null;
    }[];

    setData({
      totalRevenue,
      conversionRate,
      activeContacts,
      pipelineValue,
      revenueByMonth,
      renewalsNext30: {
        count: renewals.length,
        valueAtRisk: renewals.reduce(
          (sum, r) => sum + (r.subscription_details?.deal_value ?? 0),
          0,
        ),
      },
    });
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, period.from.getTime(), period.to.getTime()]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading };
}
