import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useOrganizations, type Organization } from "@/hooks/use-organizations";
import { useSubscription } from "@/hooks/use-subscription";
import { getPlanByPriceId, PRICING_PLANS } from "./pricing-plans";

export type Company = { id: string; name: string; address: string | null; city: string | null; postal_code: string | null; country: string | null };

export const ALL_COMPANIES: Company = { id: "all", name: "All companies" };

type Ctx = {
  current: Company;
  setCurrent: (c: Company) => void;
  companies: Company[];
  loading: boolean;
  maxCompanies: number;
  createOrg: (name: string, address?: string) => Promise<Organization | null>;
  updateOrg: (id: string, patch: { name?: string; address?: string | null; city?: string | null; postal_code?: string | null; country?: string | null }) => Promise<Organization | null>;
  deleteOrg: (id: string) => Promise<void>;
};

const CompanyContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "kstomer_current_company_id";

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { organizations, loading, createOrg, updateOrg, deleteOrg } = useOrganizations();
  const { subscription } = useSubscription();

  const companies: Company[] = useMemo(
    () => organizations.map((o) => ({ id: o.id, name: o.name, address: o.address, city: o.city, postal_code: o.postal_code, country: o.country })),
    [organizations],
  );

  const maxCompanies = useMemo(() => {
    const plan = subscription?.price_id
      ? getPlanByPriceId(subscription.price_id)
      : undefined;
    return plan?.maxCompanies ?? PRICING_PLANS[0].maxCompanies;
  }, [subscription]);

  const [current, setCurrent] = useState<Company>(() => {
    const saved = typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;
    return saved ? (JSON.parse(saved) as Company) : ALL_COMPANIES;
  });

  // Keep current in sync: if the saved company no longer exists, reset to first or ALL
  useEffect(() => {
    if (loading || companies.length === 0) return;
    const exists =
      current.id === "all" || companies.some((c) => c.id === current.id);
    if (!exists) {
      setCurrent(companies[0]);
    }
  }, [companies, loading, current.id]);

  // Update name in current if the org was renamed
  useEffect(() => {
    if (current.id === "all") return;
    const match = companies.find((c) => c.id === current.id);
    if (match && match.name !== current.name) {
      setCurrent(match);
    }
  }, [companies, current]);

  const handleSetCurrent = (c: Company) => {
    setCurrent(c);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    }
  };

  const value = useMemo(
    () => ({ current, setCurrent: handleSetCurrent, companies, loading, maxCompanies, createOrg, updateOrg, deleteOrg }),
    [current, companies, loading, maxCompanies, createOrg, updateOrg, deleteOrg],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
