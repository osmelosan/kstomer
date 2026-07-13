import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Store, TrendingUp, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import i18n from "@/lib/i18n";
import { analyzeResellers } from "@/lib/resellers-ai.functions";
import { useResellers, tierFor } from "@/hooks/use-resellers";
import { useCompany } from "@/lib/company-context";
import { AiInsightCard, type AiInsightStatus } from "@/components/AiInsightCard";

export const Route = createFileRoute("/_authenticated/resellers/")({
  head: () =>
    pageHead({
      routeKey: "resellers",
      title: i18n.t("resellers.metaTitle"),
      path: "/resellers",
      noindex: true,
    }),
  component: Resellers,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function Resellers() {
  const { t } = useTranslation();
  const { current } = useCompany();
  const { resellers, loading } = useResellers();
  const totalRevenue = resellers.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <AppShell
      title={t("resellers.title")}
      subtitle={t("resellers.subtitle")}
      search={{ placeholder: t("resellers.searchPlaceholder") }}
      actions={
        <Link
          to="/resellers/new"
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> {t("resellers.newReseller")}
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Kpi
          label={t("resellers.activePartners")}
          value={String(resellers.length)}
          icon={<Store className="h-4 w-4" />}
        />
        <Kpi
          label={t("resellers.partnerRevenue")}
          value={fmtMoney(totalRevenue)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <AIInsightsCard />

      {current.id === "all" ? (
        <div className="k-card p-6 text-sm text-muted-foreground">{t("resellers.noCompany")}</div>
      ) : loading ? (
        <div className="k-card p-6 text-sm text-muted-foreground">{t("common.loading")}</div>
      ) : resellers.length === 0 ? (
        <div className="k-card p-8 text-center text-sm text-muted-foreground">
          {t("resellers.empty")}
        </div>
      ) : (
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
              {resellers.map((r) => {
                const tier = tierFor(r.revenue);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer"
                  >
                    <td className="p-4 font-semibold">
                      <Link
                        to="/resellers/$id"
                        params={{ id: r.id }}
                        className="text-foreground hover:text-secondary transition-colors"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                          tier === "gold"
                            ? "bg-warning-soft text-warning-foreground"
                            : tier === "silver"
                              ? "bg-muted text-foreground"
                              : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {t(`resellers.tiers.${tier}`)}
                      </span>
                    </td>
                    <td className="p-4">{r.dealsCount}</td>
                    <td className="p-4">{fmtMoney(r.revenue)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-5 rounded-full"
                            style={{
                              background:
                                i <= (r.confidence_level ?? 0)
                                  ? "var(--color-secondary)"
                                  : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="k-card p-6">
      <div className="flex items-center justify-between">
        <div className="k-label">{label}</div>
        <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="text-[28px] font-bold mt-2 tracking-tight">{value}</div>
    </div>
  );
}

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { current } = useCompany();
  const analyze = useServerFn(analyzeResellers);
  const [status, setStatus] = useState<AiInsightStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("resellers.ai.errorGeneric");

  const run = async (force: boolean) => {
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({
        data: {
          language: safeLang,
          force,
          organizationId: current.id === "all" ? null : current.id,
        },
      });
      setMarkdown(result.markdown);
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) setErrorKey("resellers.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("resellers.ai.errorCredits");
      else setErrorKey("resellers.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  return (
    <AiInsightCard
      title={t("resellers.ai.title")}
      disclaimer={t("resellers.ai.disclaimer")}
      status={status}
      markdown={markdown}
      errorMessage={t(errorKey)}
      loadingLabel={t("resellers.ai.loading")}
      regenerateLabel={t("resellers.ai.regenerate")}
      onRegenerate={() => run(true)}
      className="mb-6"
    />
  );
}
