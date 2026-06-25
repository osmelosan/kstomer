export type BillingInterval = "monthly" | "yearly";

export interface PricingPlan {
  id: "starter" | "expansion" | "empire";
  name: string;
  tagline: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  monthlyAmount: number; // EUR/month
  yearlyMonthlyAmount: number; // EUR/month when billed yearly
  features: string[];
  highlighted?: boolean;
  trialDays?: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "L'essentiel pour démarrer en solo",
    monthlyPriceId: "starter_monthly",
    yearlyPriceId: "starter_yearly",
    monthlyAmount: 17,
    yearlyMonthlyAmount: 13,
    features: [
      "1 utilisateur, 1 société",
      "Pipeline et rappels intelligents",
      "Dashboard IA personnalisé",
      "Import / export CSV",
      "Support communautaire",
      "Essai gratuit 14 jours",
    ],
    trialDays: 14,
  },
  {
    id: "expansion",
    name: "Expansion",
    tagline: "Pour scaler votre portefeuille",
    monthlyPriceId: "expansion_monthly",
    yearlyPriceId: "expansion_yearly",
    monthlyAmount: 37,
    yearlyMonthlyAmount: 28,
    features: [
      "Multi-contextes / multi-sociétés",
      "Pipelines illimités",
      "Export reporting (PDF / Excel)",
      "Analyse IA avancée du portefeuille",
      "Intégrations email + calendrier",
      "Essai gratuit 14 jours",
    ],
    highlighted: true,
    trialDays: 14,
  },
  {
    id: "empire",
    name: "Empire",
    tagline: "Pour les équipes commerciales",
    monthlyPriceId: "empire_monthly",
    yearlyPriceId: "empire_yearly",
    monthlyAmount: 67,
    yearlyMonthlyAmount: 31,
    features: [
      "Tout Expansion, sans limites",
      "Vues manager + KPIs équipe",
      "Alertes deals en temps réel",
      "Jusqu'à 5 utilisateurs inclus",
      "Permissions et audit log",
      "Support prioritaire",
      "Essai gratuit 14 jours",
    ],
    trialDays: 14,
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(
    (p) => p.monthlyPriceId === priceId || p.yearlyPriceId === priceId,
  );
}
