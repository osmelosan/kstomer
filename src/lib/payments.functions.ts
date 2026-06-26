import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

type CheckoutResult = { clientSecret: string } | { error: string };
type PortalResult = { url: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      priceId: string;
      returnUrl: string;
      environment: StripeEnv;
      trialDays?: number;
    }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    console.log("[checkout] handler called env=%s priceId=%s", data.environment, data.priceId);
    try {
      const stripe = createStripeClient(data.environment);
      const { userId, supabase } = context;
      const { data: { user } } = await supabase.auth.getUser();

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      console.log("[checkout] price lookup count=%d", prices.data.length);
      if (!prices.data.length) throw new Error("Price not found: " + data.priceId);
      const stripePrice = prices.data[0];
      const isRecurring = stripePrice.type === "recurring";

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        metadata: { userId },
        ...(isRecurring && {
          subscription_data: {
            metadata: { userId },
            ...(data.trialDays && { trial_period_days: data.trialDays }),
          },
        }),
      });

      console.log("[checkout] session created hasSecret=%s", !!session.client_secret);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("[checkout] error:", getStripeErrorMessage(error));
      return { error: getStripeErrorMessage(error) };
    }
  });

export const reconcileCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true } | { error: string }> => {
    const { userId, supabase } = context;
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["subscription"],
      });

      if (session.status !== "complete") {
        return { error: "Checkout session not complete" };
      }

      // Verify this session belongs to the authenticated user
      const sessionUserId = session.metadata?.userId;
      if (sessionUserId && sessionUserId !== userId) {
        console.error("[reconcile] userId mismatch session=%s auth=%s", sessionUserId, userId);
        return { error: "Session does not belong to this user" };
      }

      const sub = session.subscription as any;
      if (!sub || typeof sub !== "object") {
        return { error: "No subscription found in checkout session" };
      }

      const item = sub.items?.data?.[0];
      const periodStart = item?.current_period_start ?? sub.current_period_start;
      const periodEnd = item?.current_period_end ?? sub.current_period_end;
      const priceId =
        item?.price?.lookup_key ||
        item?.price?.metadata?.lovable_external_id ||
        item?.price?.id ||
        "";

      // Use the user's own authenticated client — works via RLS INSERT/UPDATE policies
      const { error: dbError } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          product_id: item?.price?.product ?? "",
          price_id: priceId,
          status: sub.status,
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          environment: data.environment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      );

      if (dbError) {
        console.error("[reconcile] supabase error:", dbError);
        return { error: dbError.message };
      }

      console.log("[reconcile] subscription written for user=%s sub=%s", userId, sub.id);
      return { ok: true };
    } catch (error) {
      console.error("[reconcile] error:", getStripeErrorMessage(error));
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PortalResult> => {
    const { supabase, userId } = context;

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subError || !sub?.stripe_customer_id) {
      return { error: "No subscription found" };
    }

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id as string,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
