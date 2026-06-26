export type ResellerTier = "Bronze" | "Silver" | "Gold";

export type ResellerDeal = {
  id: string;
  name: string;
  stage: "Qualification" | "Proposition" | "Négociation" | "Gagné" | "Perdu";
  amount: string;
  closeDate: string;
};

export type Reseller = {
  slug: string;
  name: string;
  tier: ResellerTier;
  deals: number;
  revenue: string;
  health: number;
  // Contact / coordinates
  contactName: string;
  role: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  since: string;
  notes: string;
  pipeline: ResellerDeal[];
};

export const RESELLERS: Reseller[] = [
  {
    slug: "emilie-sales",
    name: "Emilie Sales",
    tier: "Bronze",
    deals: 4,
    revenue: "3 200 €",
    health: 2,
    contactName: "Émilie Laurent",
    role: "Fondatrice",
    email: "emilie@emiliesales.fr",
    phone: "+33 6 12 34 56 78",
    website: "https://emiliesales.fr",
    address: "12 rue de la Paix, 75002 Paris",
    country: "France",
    since: "2024-03-15",
    notes: "Démarrage récent, accompagnement renforcé recommandé.",
    pipeline: [
      { id: "d1", name: "Atelier Couture - Pack Pro", stage: "Proposition", amount: "1 200 €", closeDate: "2026-07-10" },
      { id: "d2", name: "Studio Visio", stage: "Qualification", amount: "800 €", closeDate: "2026-07-22" },
      { id: "d3", name: "Maison Verte", stage: "Négociation", amount: "1 200 €", closeDate: "2026-07-30" },
    ],
  },
  {
    slug: "marc-partners",
    name: "Marc Partners",
    tier: "Silver",
    deals: 12,
    revenue: "9 800 €",
    health: 4,
    contactName: "Marc Dubois",
    role: "Directeur commercial",
    email: "marc@marcpartners.com",
    phone: "+33 6 98 76 54 32",
    website: "https://marcpartners.com",
    address: "45 avenue Victor Hugo, 69006 Lyon",
    country: "France",
    since: "2023-09-02",
    notes: "Portefeuille stable, opportunités d'upsell sur l'offre Empire.",
    pipeline: [
      { id: "d1", name: "Groupe Altea", stage: "Négociation", amount: "3 400 €", closeDate: "2026-07-05" },
      { id: "d2", name: "Studio Pixel", stage: "Proposition", amount: "2 100 €", closeDate: "2026-07-18" },
      { id: "d3", name: "Cabinet Vermeer", stage: "Gagné", amount: "1 800 €", closeDate: "2026-06-20" },
      { id: "d4", name: "Agence Nord", stage: "Qualification", amount: "2 500 €", closeDate: "2026-08-01" },
    ],
  },
  {
    slug: "nova-distrib",
    name: "Nova Distrib",
    tier: "Gold",
    deals: 24,
    revenue: "21 400 €",
    health: 5,
    contactName: "Sophie Moreau",
    role: "Head of Partnerships",
    email: "sophie.moreau@nova-distrib.eu",
    phone: "+33 1 44 55 66 77",
    website: "https://nova-distrib.eu",
    address: "200 boulevard Haussmann, 75008 Paris",
    country: "France",
    since: "2022-01-12",
    notes: "Partenaire stratégique : moteur principal du CA distribué.",
    pipeline: [
      { id: "d1", name: "Helios Group - Renouvellement", stage: "Négociation", amount: "8 200 €", closeDate: "2026-07-12" },
      { id: "d2", name: "BlueOcean Retail", stage: "Proposition", amount: "5 600 €", closeDate: "2026-07-25" },
      { id: "d3", name: "Métropole Services", stage: "Gagné", amount: "4 100 €", closeDate: "2026-06-15" },
      { id: "d4", name: "Atelier Lumière", stage: "Qualification", amount: "3 500 €", closeDate: "2026-08-08" },
    ],
  },
];

export function getResellerBySlug(slug: string): Reseller | undefined {
  return RESELLERS.find((r) => r.slug === slug);
}
