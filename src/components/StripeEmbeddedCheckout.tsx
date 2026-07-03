import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface Props {
  priceId: string;
  returnUrl: string;
  trialDays?: number;
}

export function StripeEmbeddedCheckout({ priceId, returnUrl, trialDays }: Props) {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    createCheckoutSession({
      data: { priceId, returnUrl, environment: getStripeEnvironment(), trialDays },
    })
      .then(result => {
        if (cancelled) return;
        if ("error" in result) {
          setError(result.error);
        } else if (!result.clientSecret) {
          setError(t("pricing.checkoutErrorGeneric"));
        } else {
          setClientSecret(result.clientSecret);
        }
      })
      .catch(e => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : t("pricing.checkoutErrorGeneric"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [priceId, returnUrl, trialDays, t]);

  const fetchClientSecret = useCallback(() => Promise.resolve(clientSecret!), [clientSecret]);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("pricing.checkoutInitializing")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p className="font-medium">{t("pricing.checkoutError")}</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
