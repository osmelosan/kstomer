export type ResellerTier = "Bronze" | "Silver" | "Gold";

export type ResellerDeal = {
  id: string;
  name: string;
  amount: string;
  stage: string;
  closeDate: string;
};

export type ResellerClosedDeal = {
  id: string;
  name: string;
  amount: string;
  status: "won" | "lost";
  closedAt: string;
};

export type ResellerContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

export type Reseller = {
  id: string;
  name: string;
  tier: ResellerTier;
  deals: number;
  revenue: string;
  health: number;
  // Contact / coordonnées
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  // Infos commerciales
  segment: string;
  accountManager: string;
  onboardedAt: string;
  conversionRate: string;
  // Relations
  activeDeals: ResellerDeal[];
  closedDeals: ResellerClosedDeal[];
  contacts: ResellerContact[];
};

export const RESELLERS: Reseller[] = [
  {
    id: "emilie-sales",
    name: "Emilie Sales",
    tier: "Bronze",
    deals: 4,
    revenue: "3 200 €",
    health: 2,
    primaryContact: "Emilie Renard",
    email: "contact@emilie-sales.fr",
    phone: "+33 6 12 34 56 78",
    website: "https://emilie-sales.fr",
    address: "12 rue du Commerce, 75015 Paris, France",
    segment: "TPE / Freelances",
    accountManager: "Sophie Martin",
    onboardedAt: "2024-03-14",
    conversionRate: "18%",
    activeDeals: [
      { id: "d1", name: "Atelier Brunet — Pack Pro", amount: "1 200 €", stage: "Négociation", closeDate: "2026-07-15" },
      { id: "d2", name: "Studio Linea — Onboarding", amount: "800 €", stage: "Proposition", closeDate: "2026-07-22" },
    ],
    closedDeals: [
      { id: "c1", name: "Café Lumière", amount: "950 €", status: "won", closedAt: "2026-05-08" },
      { id: "c2", name: "Boutique Onde", amount: "600 €", status: "lost", closedAt: "2026-04-30" },
    ],
    contacts: [
      { id: "p1", name: "Emilie Renard", role: "Fondatrice", email: "emilie@emilie-sales.fr", phone: "+33 6 12 34 56 78" },
      { id: "p2", name: "Karim Belhadj", role: "Commercial", email: "karim@emilie-sales.fr", phone: "+33 6 98 76 54 32" },
    ],
  },
  {
    id: "marc-partners",
    name: "Marc Partners",
    tier: "Silver",
    deals: 12,
    revenue: "9 800 €",
    health: 4,
    primaryContact: "Marc Dubois",
    email: "hello@marc-partners.com",
    phone: "+33 1 45 67 89 10",
    website: "https://marc-partners.com",
    address: "45 avenue de la République, 69003 Lyon, France",
    segment: "PME B2B",
    accountManager: "Sophie Martin",
    onboardedAt: "2023-09-02",
    conversionRate: "34%",
    activeDeals: [
      { id: "d3", name: "Groupe Veritas — Expansion", amount: "4 500 €", stage: "Closing", closeDate: "2026-07-04" },
      { id: "d4", name: "Optima Conseil", amount: "2 100 €", stage: "Découverte", closeDate: "2026-08-12" },
      { id: "d5", name: "Mobil'Up", amount: "1 800 €", stage: "Proposition", closeDate: "2026-07-28" },
    ],
    closedDeals: [
      { id: "c3", name: "Axis Lab", amount: "3 200 €", status: "won", closedAt: "2026-05-21" },
      { id: "c4", name: "Domus Group", amount: "2 700 €", status: "won", closedAt: "2026-04-12" },
      { id: "c5", name: "Edenia", amount: "1 100 €", status: "lost", closedAt: "2026-03-30" },
    ],
    contacts: [
      { id: "p3", name: "Marc Dubois", role: "Directeur", email: "marc@marc-partners.com", phone: "+33 1 45 67 89 10" },
      { id: "p4", name: "Léa Fontaine", role: "Account Manager", email: "lea@marc-partners.com", phone: "+33 6 11 22 33 44" },
      { id: "p5", name: "Jonas Petit", role: "Avant-vente", email: "jonas@marc-partners.com", phone: "+33 6 55 66 77 88" },
    ],
  },
  {
    id: "nova-distrib",
    name: "Nova Distrib",
    tier: "Gold",
    deals: 24,
    revenue: "21 400 €",
    health: 5,
    primaryContact: "Nora Vasquez",
    email: "team@novadistrib.com",
    phone: "+33 4 78 12 34 56",
    website: "https://novadistrib.com",
    address: "8 quai des Brotteaux, 69006 Lyon, France",
    segment: "Grands comptes",
    accountManager: "Antoine Leroy",
    onboardedAt: "2022-11-18",
    conversionRate: "52%",
    activeDeals: [
      { id: "d6", name: "Helix Industries — Multi-sites", amount: "9 800 €", stage: "Closing", closeDate: "2026-07-09" },
      { id: "d7", name: "Polaris Tech", amount: "5 400 €", stage: "Négociation", closeDate: "2026-07-25" },
      { id: "d8", name: "Vega Logistics", amount: "3 600 €", stage: "Proposition", closeDate: "2026-08-05" },
    ],
    closedDeals: [
      { id: "c6", name: "Atlas Corp", amount: "8 200 €", status: "won", closedAt: "2026-06-01" },
      { id: "c7", name: "Borealis", amount: "5 100 €", status: "won", closedAt: "2026-05-18" },
      { id: "c8", name: "Crysta", amount: "2 900 €", status: "won", closedAt: "2026-04-25" },
    ],
    contacts: [
      { id: "p6", name: "Nora Vasquez", role: "CEO", email: "nora@novadistrib.com", phone: "+33 4 78 12 34 56" },
      { id: "p7", name: "Tom Garrido", role: "Head of Sales", email: "tom@novadistrib.com", phone: "+33 6 22 33 44 55" },
      { id: "p8", name: "Inès Albert", role: "Customer Success", email: "ines@novadistrib.com", phone: "+33 6 77 88 99 00" },
    ],
  },
];

export function getResellerById(id: string): Reseller | undefined {
  return RESELLERS.find((r) => r.id === id);
}
