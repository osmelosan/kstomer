import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string;
  product_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) { setData(null); setLoading(false); }
        return;
      }
      let env: "sandbox" | "live" = "sandbox";
      try { env = getStripeEnvironment(); } catch { /* keep sandbox default */ }
      const { data: row } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mounted) {
        setData((row as unknown as SubscriptionRow) ?? null);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`subscriptions-self-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const isActive = !!data && (
    (["active", "trialing", "past_due"].includes(data.status) &&
      (!data.current_period_end || new Date(data.current_period_end) > new Date())) ||
    (data.status === "canceled" && data.current_period_end && new Date(data.current_period_end) > new Date())
  );

  return { subscription: data, loading, isActive };
}
