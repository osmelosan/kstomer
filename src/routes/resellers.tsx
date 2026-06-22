import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Store, TrendingUp, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import i18n from "@/lib/i18n";
import { analyzeResellers } from "@/lib/resellers-ai.functions";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Kpi label={t("resellers.activePartners")} value="14" icon={<Store className="h-4 w-4" />} />
        <Kpi label={t("resellers.partnerRevenue")} value="34 400 €" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <AIInsightsCard />

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

type AIStatus = "idle" | "loading" | "ready" | "error";

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const analyze = useServerFn(analyzeResellers);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("resellers.ai.errorGeneric");

  const run = async () => {
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({
        data: {
          language: safeLang,
          resellers: RESELLERS,
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
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="k-card p-6 mb-6 border-l-4 border-l-secondary">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] tracking-tight">{t("resellers.ai.title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("resellers.ai.disclaimer")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? t("resellers.ai.loading") : t("resellers.ai.regenerate")}
        </button>
      </div>

      {status === "loading" && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t(errorKey)}</span>
        </div>
      )}

      {status === "ready" && (
        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
