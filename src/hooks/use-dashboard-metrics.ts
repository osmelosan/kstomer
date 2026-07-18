import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DashboardMetrics = {
  revenue: number;
  subscriberCount: number;
};

const EMPTY: DashboardMetrics = { revenue: 0, subscriberCount: 0 };

type ActiveContactRow = {
  subscription_details: { deal_value: number | null } | null;
};

// Current-snapshot metrics for the dashboard's top cards: total revenue and
// subscriber count, both scoped to a single organization (or every
// organization the signed-in user owns, when organizationId is null — see
// the current.id === "all" convention in Dashboard). Deliberately not built
// on useAnalytics: that hook requires a {from, to} period (the dashboard
// wants an always-current snapshot, not a period total) and its
// `activeContacts` field actually means "contacted in the last 30 days",
// not "count of contacts in the active stage" — reusing it here would
// silently produce the wrong number for "nombre d'abonnés".
export function useDashboardMetrics(organizationId: string | null) {
  const [data, setData] = useState<DashboardMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("contacts")
      .select("id, subscription_details(deal_value)")
      .eq("stage", "active")
      .is("archived_at", null);
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data: rows } = await query;
    const contacts = (rows ?? []) as unknown as ActiveContactRow[];

    const revenue = contacts.reduce(
      (sum, c) => sum + (c.subscription_details?.deal_value ?? 0),
      0,
    );

    setData({ revenue, subscriberCount: contacts.length });
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading };
}
