import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Company = { id: string; name: string };

export const COMPANIES: Company[] = [
  { id: "kstomer", name: "Kstomer" },
  { id: "acme", name: "Acme Studio" },
  { id: "northwind", name: "Northwind Co." },
];

export const ALL_COMPANIES: Company = { id: "all", name: "All companies" };

type Ctx = {
  current: Company;
  setCurrent: (c: Company) => void;
  companies: Company[];
};

const CompanyContext = createContext<Ctx | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Company>(COMPANIES[0]);
  const value = useMemo(() => ({ current, setCurrent, companies: COMPANIES }), [current]);
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
