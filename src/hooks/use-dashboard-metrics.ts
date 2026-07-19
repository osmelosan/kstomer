import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DashboardMetrics = {
  revenue: number;
  subscriberCount: number;
  conversionRate: number;
  newActiveCount: number;
  revenueDeltaPct: number;
  activeDeltaPct: number;
  avgCycleDays: number | null;
};

const EMPTY: DashboardMetrics = {
  revenue: 0,
  subscriberCount: 0,
  conversionRate: 0,
  newActiveCount: 0,
  revenueDeltaPct: 0,
  activeDeltaPct: 0,
  avgCycleDays: null,
};

type ContactRow = {
  id: string;
  stage: string;
  created_at: string;
  subscription_details: { deal_value: number | null } | null;
};

type StageHistoryRow = {
  contact_id: string;
  changed_at: string;
};

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Current-snapshot + trend metrics for the dashboard's top cards, scoped to a
// single organization (or every organization the signed-in user owns, when
// organizationId is null). Deliberately not built on useAnalytics: that hook
// requires a {from, to} period and its `activeContacts` field actually means
// "contacted in the last 30 days," not "count of contacts in the active
// stage." Two queries: all non-archived contacts (snapshot numbers + the
// created_at-bucketed month-over-month deltas, mirroring useAnalytics'
// revenueByMonth bucketing), and stage_history (average time-to-convert —
// write-only until now; changeStage in use-contacts.ts is the only place
// that inserts rows into it).
export function useDashboardMetrics(organizationId: string | null) {
  const [data, setData] = useState<DashboardMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let contactsQuery = supabase
      .from("contacts")
      .select("id, stage, created_at, subscription_details(deal_value)")
      .is("archived_at", null);
    if (organizationId) contactsQuery = contactsQuery.eq("organization_id", organizationId);

    let historyQuery = supabase
      .from("stage_history")
      .select("contact_id, changed_at")
      .eq("to_stage", "active");
    if (organizationId) historyQuery = historyQuery.eq("organization_id", organizationId);

    const [{ data: contactRows }, { data: historyRows }] = await Promise.all([
      contactsQuery,
      historyQuery,
    ]);
    const contacts = (contactRows ?? []) as unknown as ContactRow[];
    const history = (historyRows ?? []) as unknown as StageHistoryRow[];

    const active = contacts.filter((c) => c.stage === "active");
    const revenue = active.reduce((sum, c) => sum + (c.subscription_details?.deal_value ?? 0), 0);
    const subscriberCount = active.length;
    const conversionRate = contacts.length > 0 ? (subscriberCount / contacts.length) * 100 : 0;

    const now = new Date();
    const currentKey = monthKey(now.toISOString());
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousKey = monthKey(previousMonthDate.toISOString());

    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;
    let currentMonthNewCount = 0;
    let previousMonthNewCount = 0;
    active.forEach((c) => {
      const key = monthKey(c.created_at);
      const value = c.subscription_details?.deal_value ?? 0;
      if (key === currentKey) {
        currentMonthRevenue += value;
        currentMonthNewCount += 1;
      } else if (key === previousKey) {
        previousMonthRevenue += value;
        previousMonthNewCount += 1;
      }
    });

    const revenueDeltaPct =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;
    const activeDeltaPct =
      previousMonthNewCount > 0
        ? ((currentMonthNewCount - previousMonthNewCount) / previousMonthNewCount) * 100
        : 0;

    // Earliest transition into `active` per contact (a contact may have
    // bounced in/out of active more than once — first time in is the
    // time-to-convert), joined against created_at from the contacts query.
    const firstActiveAt = new Map<string, string>();
    history.forEach((h) => {
      const existing = firstActiveAt.get(h.contact_id);
      if (!existing || new Date(h.changed_at).getTime() < new Date(existing).getTime()) {
        firstActiveAt.set(h.contact_id, h.changed_at);
      }
    });
    const createdAtById = new Map(contacts.map((c) => [c.id, c.created_at]));
    const cycleDays: number[] = [];
    firstActiveAt.forEach((changedAt, contactId) => {
      const createdAt = createdAtById.get(contactId);
      if (!createdAt) return;
      const days = (new Date(changedAt).getTime() - new Date(createdAt).getTime()) / 86_400_000;
      if (days >= 0) cycleDays.push(days);
    });
    const avgCycleDays =
      cycleDays.length > 0
        ? Math.round(cycleDays.reduce((sum, d) => sum + d, 0) / cycleDays.length)
        : null;

    setData({
      revenue,
      subscriberCount,
      conversionRate,
      newActiveCount: currentMonthNewCount,
      revenueDeltaPct,
      activeDeltaPct,
      avgCycleDays,
    });
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading };
}
