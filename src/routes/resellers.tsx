import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Store, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/resellers")({
  head: () => ({ meta: [{ title: i18n.t("resellers.metaTitle") }] }),
  component: Resellers,
});

const RESELLERS = [
  { name: "Emilie Sales", tier: "Bronze", deals: 4, revenue: "3 200 €", health: 2 },
  { name: "Marc Partners", tier: "Silver", deals: 12, revenue: "9 800 €", health: 4 },
  { name: "Nova Distrib", tier: "Gold", deals: 24, revenue: "21 400 €", health: 5 },
];

function Resellers() {
  const { t } = useTranslation();
  return (
    <AppShell
      title={t("resellers.title")}
      subtitle={t("resellers.subtitle")}
      search={{ placeholder: t("resellers.searchPlaceholder") }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Kpi label={t("resellers.activePartners")} value="14" icon={<Store className="h-4 w-4" />} />
        <Kpi label={t("resellers.partnerRevenue")} value="34 400 €" icon={<TrendingUp className="h-4 w-4" />} />
        <Kpi label={t("resellers.goldTier")} value="3" icon={<Award className="h-4 w-4" />} />
      </div>

      <div className="k-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
              <th className="text-left p-4">{t("resellers.th.partner")}</th>
              <th className="text-left p-4">{t("resellers.th.tier")}</th>
              <th className="text-left p-4">{t("resellers.th.deals")}</th>
              <th className="text-left p-4">{t("resellers.th.revenue")}</th>
              <th className="text-left p-4">{t("resellers.th.health")}</th>
            </tr>
          </thead>
          <tbody>
            {RESELLERS.map((r) => (
              <tr key={r.name} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="p-4 font-semibold">{r.name}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                      r.tier === "Gold"
                        ? "bg-warning-soft text-warning-foreground"
                        : r.tier === "Silver"
                          ? "bg-muted text-foreground"
                          : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {r.tier}
                  </span>
                </td>
                <td className="p-4">{r.deals}</td>
                <td className="p-4">{r.revenue}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-5 rounded-full"
                        style={{
                          background:
                            i <= r.health
                              ? "var(--color-secondary)"
                              : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="k-card p-6">
      <div className="flex items-center justify-between">
        <div className="k-label">{label}</div>
        <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">{icon}</div>
      </div>
      <div className="text-[28px] font-bold mt-2 tracking-tight">{value}</div>
    </div>
  );
}
