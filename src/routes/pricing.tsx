import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, ArrowLeft, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PRICING_PLANS, type BillingInterval, type PricingPlan, getPlanByPriceId } from "@/lib/pricing-plans";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/route-seo";
import { useSubscription } from "@/hooks/use-subscription";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/pricing")({
  head: () =>
    pageHead({
      routeKey: "pricing",
      title: "Tarifs — Kstomer",
      path: "/pricing",
    }),
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { subscription, isActive } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const currentPlanId = isActive && subscription
    ? getPlanByPriceId(subscription.price_id)?.id
    : undefined;

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const result = await createPortalSession({
        data: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/settings` },
      });
      if ("error" in result) toast.error(result.error);
      else window.open(result.url, "_blank");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSelect = (plan: PricingPlan) => {
    if (authed === false) {
      navigate({ to: "/auth", search: { redirect: "/pricing" } as never });
      return;
    }
    if (currentPlanId && currentPlanId !== plan.id) {
      // Switching plans → Stripe portal handles proration.
      openPortal();
      return;
    }
    setCheckoutPlan(plan);
  };


  if (checkoutPlan) {
    const priceId =
      interval === "monthly" ? checkoutPlan.monthlyPriceId : checkoutPlan.yearlyPriceId;
    const returnUrl = `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCheckoutPlan(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux tarifs
          </button>
          <div className="k-card p-2">
            <StripeEmbeddedCheckout
              priceId={priceId}
              returnUrl={returnUrl}
              trialDays={checkoutPlan.trialDays}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight">
            Choisissez votre plan
          </h1>
          <p className="mt-4 text-muted-foreground text-[16px] max-w-xl mx-auto">
            Essai gratuit 14 jours sur Expansion. Sans engagement, annulez à tout moment.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setInterval("monthly")}
              className={cn(
                "px-5 h-9 rounded-full text-sm font-medium transition-colors",
                interval === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={cn(
                "px-5 h-9 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                interval === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              Annuel
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const amount =
              interval === "monthly" ? plan.monthlyAmount : plan.yearlyMonthlyAmount;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border bg-card p-7 flex flex-col",
                  plan.highlighted
                    ? "border-secondary shadow-[0_8px_30px_rgba(37,99,235,0.15)] md:scale-[1.02]"
                    : "border-border",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3" />
                    Le plus populaire
                  </div>
                )}
                <div>
                  <h3 className="text-[22px] font-bold tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-[40px] font-extrabold tracking-tight">€{amount}</span>
                  <span className="text-sm text-muted-foreground">/ mois</span>
                </div>
                {interval === "yearly" && (
                  <p className="text-xs text-muted-foreground">Facturé annuellement</p>
                )}
                {plan.trialDays && (
                  <p className="mt-2 text-xs font-semibold text-tertiary">
                    Essai gratuit {plan.trialDays} jours
                  </p>
                )}

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-tertiary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={authed === null}
                  className={cn(
                    "mt-7 h-11 rounded-lg text-sm font-semibold transition-colors",
                    plan.highlighted
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {plan.trialDays ? "Démarrer l'essai gratuit" : "Choisir ce plan"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Paiements sécurisés. TVA gérée automatiquement.
        </p>
      </div>
    </main>
  );
}
