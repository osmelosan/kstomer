import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useState, useCallback } from "react";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface Props {
  priceId: string;
  returnUrl: string;
  trialDays?: number;
}

export function StripeEmbeddedCheckout({ priceId, returnUrl, trialDays }: Props) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const result = await createCheckoutSession({
      data: { priceId, returnUrl, environment: getStripeEnvironment(), trialDays },
    });
    if ("error" in result) {
      setError(result.error);
      throw new Error(result.error);
    }
    if (!result.clientSecret) {
      setError("Une erreur est survenue lors de l'initialisation du paiement.");
      throw new Error("Stripe did not return a client secret");
    }
    return result.clientSecret;
  }, [priceId, returnUrl, trialDays]);

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p className="font-medium">Une erreur est survenue</p>
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
