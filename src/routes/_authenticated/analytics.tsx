import { pageHead } from "@/lib/route-seo";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  MousePointerClick,
  Users,
  Sparkles,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CalendarIcon,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr as frLocale, es as esLocale, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeAnalytics } from "@/lib/analytics-ai.functions";
import { useCompany } from "@/lib/company-context";
import { useAnalytics, type AnalyticsPeriod } from "@/hooks/use-analytics";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () =>
    pageHead({
      routeKey: "analytics",
      title: i18n.t("analytics.metaTitle"),
      path: "/analytics",
      noindex: true,
    }),
  component: Analytics,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function periodFor(selected: string, range: DateRange | undefined): AnalyticsPeriod {
  const to = new Date();
  if (selected === "custom" && range?.from) {
    return { from: range.from, to: range.to ?? to };
  }
  const days = selected === "year" ? 365 : selected === "quarter" ? 90 : 30;
  return { from: new Date(Date.now() - days * 24 * 60 * 60 * 1000), to };
}

function Analytics() {
  const { t } = useTranslation();
  const { current } = useCompany();
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

  const period = useMemo(() => periodFor(selected, range), [selected, range]);
  const { data, loading } = useAnalytics(current.id === "all" ? null : current.id, period);

  const formatRange = (r: DateRange) => {
    if (r.from && r.to) {
      return `${format(r.from, "d MMM", { locale: dfLocale })} – ${format(r.to, "d MMM yyyy", { locale: dfLocale })}`;
    }
    if (r.from) return format(r.from, "d MMM yyyy", { locale: dfLocale });
    return t("analytics.pickDateRange");
  };

  const monthLabel = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return format(new Date(y, m - 1, 1), "MMM", { locale: dfLocale });
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
                  selected === "custom" &&
                    "bg-secondary text-secondary-foreground font-semibold border-secondary hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {selected === "custom" && range ? formatRange(range) : t("analytics.custom")}
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
      {current.id === "all" ? (
        <div className="k-card p-6 text-sm text-muted-foreground mb-8">
          {t("analytics.noCompany")}
        </div>
      ) : (
        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <Kpi
              label={t("analytics.totalRevenue")}
              value={loading ? "—" : fmtMoney(data.totalRevenue)}
              icon={<Wallet className="h-4 w-4" />}
              info={t("analytics.infos.totalRevenue")}
            />
            <Kpi
              label={t("analytics.conversionRate")}
              value={loading ? "—" : `${data.conversionRate.toFixed(1)}%`}
              icon={<MousePointerClick className="h-4 w-4" />}
              info={t("analytics.infos.conversionRate")}
            />
            <Kpi
              label={t("analytics.activeContacts")}
              value={loading ? "—" : String(data.activeContacts)}
              icon={<Users className="h-4 w-4" />}
              info={t("analytics.infos.activeContacts")}
            />
            <Kpi
              label={t("analytics.opportunities")}
              value={loading ? "—" : fmtMoney(data.pipelineValue)}
              icon={<TrendingUp className="h-4 w-4" />}
              info={t("analytics.infos.opportunities")}
            />
          </div>
        </TooltipProvider>
      )}

      <AIInsightsCard />

      {current.id !== "all" && (
        <div className="k-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-semibold tracking-tight">
              {t("analytics.revenueGrowth")}
            </h3>
            <Legend dot="var(--color-secondary)">{t("analytics.current")}</Legend>
          </div>
          {loading ? (
            <div className="h-[280px] animate-pulse bg-muted rounded-md" />
          ) : data.revenueByMonth.length === 0 ? (
            <div className="h-[280px] grid place-items-center text-sm text-muted-foreground">
              {t("analytics.noRevenueData")}
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.revenueByMonth.map((r) => ({ m: monthLabel(r.month), v: r.value }))}
                >
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="m"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                    formatter={(v: number) => fmtMoney(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-secondary)"
                    fill="url(#g)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {current.id !== "all" && !loading && data.renewalsNext30.count > 0 && (
        <div className="rounded-2xl bg-warning-soft border border-warning/30 p-7">
          <AlertTriangle className="h-6 w-6 text-warning-foreground" />
          <h3 className="mt-3 text-[20px] font-bold tracking-tight">
            {t("analytics.renewalsTitle")}
          </h3>
          <p className="mt-2 text-sm text-foreground/80">
            <Trans
              i18nKey="analytics.renewalsBody"
              values={{
                count: data.renewalsNext30.count,
                value: fmtMoney(data.renewalsNext30.valueAtRisk),
              }}
              components={[<strong className="text-foreground" />]}
            />
          </p>
        </div>
      )}
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  icon,
  info,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  info?: string;
}) {
  return (
    <div className="k-card p-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="k-label mt-4 flex items-center gap-1">
        <span>{label}</span>
        {info ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={info}
                className="inline-flex items-center text-muted-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-full"
              >
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
              {info}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="text-[28px] font-bold mt-1 tracking-tight">{value}</div>
    </div>
  );
}

function Legend({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}

type AIStatus = "idle" | "loading" | "ready" | "error";

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { current } = useCompany();
  const analyze = useServerFn(analyzeAnalytics);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("analytics.ai.errorGeneric");

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
      if (msg.includes("RATE_LIMIT")) setErrorKey("analytics.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("analytics.ai.errorCredits");
      else setErrorKey("analytics.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

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
          onClick={() => run(true)}
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
