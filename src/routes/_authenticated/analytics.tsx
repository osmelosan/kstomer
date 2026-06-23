import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  MousePointerClick,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr as frLocale, es as esLocale, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeAnalytics } from "@/lib/analytics-ai.functions";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: i18n.t("analytics.metaTitle") }] }),
  component: Analytics,
});

const REVENUE = [
  { m: "Jan", v: 22, p: 18 },
  { m: "Feb", v: 26, p: 20 },
  { m: "Mar", v: 24, p: 22 },
  { m: "Apr", v: 32, p: 25 },
  { m: "May", v: 36, p: 28 },
  { m: "Jun", v: 40, p: 32 },
  { m: "Jul", v: 42, p: 33 },
  { m: "Aug", v: 45, p: 36 },
];

function Analytics() {
  const { t } = useTranslation();
  const SOURCES = [
    { label: t("analytics.sources.linkedin"), value: 42 },
    { label: t("analytics.sources.referral"), value: 28 },
    { label: t("analytics.sources.directSearch"), value: 15 },
    { label: t("analytics.sources.others"), value: 15 },
  ];
  const PERIODS: { key: string; label: string }[] = [
    { key: "last30", label: t("analytics.last30") },
    { key: "quarter", label: t("analytics.quarter") },
    { key: "year", label: t("analytics.year") },
  ];
  const [selected, setSelected] = useState<string>("last30");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const lang = (i18n.language || "fr").split("-")[0];
  const dfLocale = lang === "es" ? esLocale : lang === "en" ? enUS : frLocale;

  const formatRange = (r: DateRange) => {
    if (r.from && r.to) {
      return `${format(r.from, "d MMM", { locale: dfLocale })} – ${format(r.to, "d MMM yyyy", { locale: dfLocale })}`;
    }
    if (r.from) return format(r.from, "d MMM yyyy", { locale: dfLocale });
    return t("analytics.pickDateRange");
  };

  return (
    <AppShell
      search={{ placeholder: t("analytics.searchPlaceholder") }}
      title={t("analytics.title")}
      subtitle={t("analytics.subtitle")}
      actions={
        <div className="hidden md:inline-flex items-center gap-2 ml-2">
          <div className="inline-flex items-center rounded-md border border-input bg-card overflow-hidden text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelected(p.key)}
                className={cn(
                  "h-10 px-3",
                  selected === p.key
                    ? "bg-secondary text-secondary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 gap-2 text-sm font-normal",
                  selected === "custom" && "bg-secondary text-secondary-foreground font-semibold border-secondary hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {selected === "custom" && range
                  ? formatRange(range)
                  : t("analytics.custom")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => {
                  setRange(r);
                  if (r?.from) setSelected("custom");
                }}
                numberOfMonths={2}
                locale={dfLocale}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRange(undefined);
                    setSelected("last30");
                  }}
                >
                  {t("analytics.reset")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={!range?.from || !range?.to}
                >
                  {t("analytics.apply")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Kpi label={t("analytics.totalRevenue")} value="45 280,00 €" icon={<Wallet className="h-4 w-4" />} delta="+12.5%" />
        <Kpi label={t("analytics.conversionRate")} value="24.8%" icon={<MousePointerClick className="h-4 w-4" />} delta="+3.2%" />
        <Kpi label={t("analytics.activeContacts")} value="1 284" icon={<Users className="h-4 w-4" />} delta={t("analytics.vsLastMonth")} neutral />
        <Kpi label={t("analytics.opportunities")} value="128 500 €" icon={<TrendingUp className="h-4 w-4" />} delta="+8k €" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="k-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-semibold tracking-tight">{t("analytics.revenueGrowth")}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Legend dot="var(--color-secondary)">{t("analytics.current")}</Legend>
              <Legend dot="color-mix(in oklab, var(--color-secondary) 30%, white)">
                {t("analytics.previous")}
              </Legend>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-secondary)" fill="url(#g)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="k-card p-6">
          <h3 className="text-[18px] font-semibold tracking-tight mb-4">{t("analytics.leadSources")}</h3>
          <div className="space-y-4">
            {SOURCES.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{s.label}</span>
                  <span className="font-semibold">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/10 overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${s.value * 2.2}%`, maxWidth: "100%" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-md bg-muted text-sm italic text-muted-foreground">
            {t("analytics.quote")}
          </div>
        </div>
      </div>

      <div className="k-card p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            {t("analytics.segmentsPerformance")}
          </h3>
          <button className="text-secondary text-sm font-semibold hover:underline">{t("analytics.exportCsv")}</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left py-3">{t("analytics.th.clientType")}</th>
              <th className="text-left py-3">{t("analytics.th.volume")}</th>
              <th className="text-left py-3">{t("analytics.th.conversion")}</th>
              <th className="text-left py-3">{t("analytics.th.avgValue")}</th>
              <th className="text-left py-3">{t("analytics.th.healthScore")}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { tKey: "analytics.segments.saas", sKey: "analytics.segments.saasSub", v: 42, c: "32.4%", avg: "1 240 €", h: 4 },
              { tKey: "analytics.segments.solo", sKey: "analytics.segments.soloSub", v: 156, c: "18.2%", avg: "450 €", h: 3 },
              { tKey: "analytics.segments.agencies", sKey: "analytics.segments.agenciesSub", v: 28, c: "26.1%", avg: "2 100 €", h: 5 },
            ].map((r) => (
              <tr key={r.tKey} className="border-b border-border last:border-0">
                <td className="py-4">
                  <div className="font-semibold">{t(r.tKey)}</div>
                  <div className="text-xs text-muted-foreground">{t(r.sKey)}</div>
                </td>
                <td className="py-4">{r.v}</td>
                <td className="py-4">
                  <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-success-soft text-success">
                    {r.c}
                  </span>
                </td>
                <td className="py-4">{r.avg}</td>
                <td className="py-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-6 rounded-full"
                        style={{
                          background:
                            i <= r.h
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

      <AIInsightsCard />

      <div className="rounded-2xl bg-warning-soft border border-warning/30 p-7">
        <AlertTriangle className="h-6 w-6 text-warning-foreground" />
        <h3 className="mt-3 text-[20px] font-bold tracking-tight">{t("analytics.renewalsTitle")}</h3>
        <p className="mt-2 text-sm text-foreground/80">
          <Trans i18nKey="analytics.renewalsBody" components={[<strong className="text-foreground" />]} />
        </p>
        <button className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-warning text-warning-foreground text-sm font-semibold">
          {t("analytics.seeList")}
        </button>
      </div>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  icon,
  delta,
  neutral,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta: string;
  neutral?: boolean;
}) {
  return (
    <div className="k-card p-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">{icon}</div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 ${
            neutral ? "bg-muted text-muted-foreground" : "bg-success-soft text-success"
          }`}
        >
          {!neutral && <TrendingUp className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <div className="k-label mt-4">{label}</div>
      <div className="text-[28px] font-bold mt-1 tracking-tight">{value}</div>
    </div>
  );
}

function Legend({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}

type AIStatus = "idle" | "loading" | "ready" | "error";

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const analyze = useServerFn(analyzeAnalytics);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("analytics.ai.errorGeneric");

  const run = async () => {
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({
        data: {
          language: safeLang,
          kpis: {
            revenue: "45 280 €",
            conversion: "24.8%",
            activeContacts: "1284",
            opportunities: "128 500 €",
          },
          sources: [
            { label: "LinkedIn", value: 42 },
            { label: "Referral", value: 28 },
            { label: "Direct search", value: 15 },
            { label: "Others", value: 15 },
          ],
          segments: [
            { name: "SaaS", volume: 42, conversion: "32.4%", avgValue: "1240 €", health: 4 },
            { name: "Solopreneurs", volume: 156, conversion: "18.2%", avgValue: "450 €", health: 3 },
            { name: "Agencies", volume: 28, conversion: "26.1%", avgValue: "2100 €", health: 5 },
          ],
        },
      });
      setMarkdown(result.markdown);
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) setErrorKey("analytics.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("analytics.ai.errorCredits");
      else setErrorKey("analytics.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="k-card p-6 mb-5 border-l-4 border-l-secondary">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] tracking-tight">{t("analytics.ai.title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("analytics.ai.disclaimer")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? t("analytics.ai.loading") : t("analytics.ai.regenerate")}
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
