import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Plus,
  Mail,
  Phone,
  Linkedin,
  TrendingUp,
  Sparkles,
  Building2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRevenueGoal } from "@/hooks/use-revenue-goal";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCompany } from "@/lib/company-context";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDashboard } from "@/lib/dashboard-ai.functions";
import { analyzeProspects, type Prospect } from "@/lib/prospects-ai.functions";
import { getPriorityActions, type PriorityAction } from "@/lib/priority-actions.functions";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () =>
    pageHead({
      routeKey: "dashboard",
      title: i18n.t("dashboard.metaTitle"),
      path: "/dashboard",
      noindex: true,
    }),
  component: Dashboard,
});

function Dashboard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { goal } = useRevenueGoal();
  const { profile, user } = useCurrentUser();
  const currentRevenue = 12450;
  const locale = i18nInstance.language || "fr";
  const goalFormatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(goal);
  const progress = Math.min(100, Math.round((currentRevenue / goal) * 100));
  const fullName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";
  const firstName = fullName.split(/\s+/)[0] || "";
  return (
    <AppShell
      title={t("dashboard.title")}
      subtitle={t("dashboard.subtitle", { name: firstName })}
      actions={
        <Link
          to="/contacts/new"
          className="hidden md:inline-flex ml-2 items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="h-4 w-4" /> {t("dashboard.newOpportunity")}
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <MetricCard
          label={t("dashboard.revenue")}
          value="12 450,00 €"
          accent={{ tone: "success", label: t("dashboard.revenueDelta") }}
          progress={progress}
          footer={t("dashboard.revenueGoal", { goal: goalFormatted })}
        />
        <MetricCard
          label={t("dashboard.activeClients")}
          value="24"
          accent={{ tone: "info", label: t("dashboard.newBadge") }}
          footer={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              {t("dashboard.vsLastMonth")}
            </span>
          }
        />
        <MetricCard
          label={t("dashboard.conversionRate")}
          value="38,2%"
          accent={{ tone: "warning", label: t("dashboard.toMonitor") }}
          footer={t("dashboard.avgCycle")}
        />
      </div>

      <AIInsightsCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <PriorityActionsCard />

        <AIProspectsCard />
      </div>
    </AppShell>
  );
}

type Tone = "success" | "warning" | "info" | "danger" | "neutral";

function toneClasses(tone: Tone) {
  switch (tone) {
    case "success":
      return "bg-success-soft text-success border-success/20";
    case "warning":
      return "bg-warning-soft text-warning-foreground border-warning/30";
    case "info":
      return "bg-secondary/10 text-secondary border-secondary/20";
    case "danger":
      return "bg-[color:var(--color-danger-soft)] text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function MetricCard({
  label,
  value,
  accent,
  progress,
  footer,
}: {
  label: string;
  value: string;
  accent?: { tone: Tone; label: string };
  progress?: number;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex justify-between items-start gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {accent && (
          <span
            className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${toneClasses(accent.tone)}`}
          >
            {accent.label}
          </span>
        )}
      </div>
      <p className="text-[30px] font-bold leading-tight mt-2 tabular-nums tracking-tight">
        {value}
      </p>
      {typeof progress === "number" && (
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {footer && <p className="text-[11px] text-muted-foreground mt-2">{footer}</p>}
    </div>
  );
}

function SectionHeader({ title, cta, ctaTo }: { title: string; cta?: string; ctaTo?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em]">{title}</h2>
      {cta && ctaTo && (
        <Link to={ctaTo} className="text-xs font-medium text-secondary hover:underline">
          {cta}
        </Link>
      )}
      {cta && !ctaTo && (
        <button className="text-xs font-medium text-secondary hover:underline">{cta}</button>
      )}
    </div>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  tag,
  to,
  taskId,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: { label: string; tone: Tone };
  to?: string;
  taskId?: string;
}) {
  const content = (
    <>
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${toneClasses(tag.tone)}`}
        >
          {tag.label}
        </span>
      </div>
    </>
  );

  const className =
    "p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 group cursor-pointer";

  if (taskId) {
    return (
      <Link to="/tasks" search={{ focus: taskId }} className={className}>
        {content}
      </Link>
    );
  }
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

type PriorityStatus = "idle" | "loading" | "ready" | "error";

function PriorityActionsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const getActions = useServerFn(getPriorityActions);
  const [status, setStatus] = useState<PriorityStatus>("idle");
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const locale = i18nInstance.language || "fr";

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getActions()
      .then((result) => {
        if (cancelled) return;
        setActions(result.actions);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtitleFor = (action: PriorityAction) => {
    if (action.overdue) {
      const days = Math.max(
        1,
        Math.ceil((Date.now() - new Date(action.dueDate).getTime()) / 86_400_000),
      );
      const label = t("dashboard.actions.overdueBy", { count: days });
      return action.contact ? `${action.contact} · ${label}` : label;
    }
    const isToday = new Date(action.dueDate).toDateString() === new Date().toDateString();
    const label = isToday
      ? t("dashboard.actions.dueToday")
      : t("dashboard.actions.dueOn", {
          date: new Date(action.dueDate).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
          }),
        });
    return action.contact ? `${action.contact} · ${label}` : label;
  };

  const tagFor = (action: PriorityAction): { label: string; tone: Tone } => {
    if (action.overdue) return { label: t("dashboard.tags.late"), tone: "danger" };
    if (action.priority === "high") return { label: t("dashboard.tags.urgent"), tone: "warning" };
    return { label: t("dashboard.tags.todo"), tone: "info" };
  };

  return (
    <section className="space-y-4">
      <SectionHeader
        title={t("dashboard.priorityActions")}
        cta={t("dashboard.seeAll")}
        ctaTo="/tasks"
      />
      <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-card">
        {status === "loading" && (
          <div className="p-4 space-y-2 animate-pulse">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        )}

        {status === "error" && (
          <div className="p-4 flex items-start gap-2 text-sm text-error">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t("dashboard.ai.errorGeneric")}</span>
          </div>
        )}

        {status === "ready" && actions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">{t("dashboard.actions.empty")}</p>
        )}

        {status === "ready" &&
          actions.map((action) => (
            <ActionRow
              key={action.id}
              taskId={action.id}
              icon={
                action.overdue ? (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Mail className="h-5 w-5 text-muted-foreground" />
                )
              }
              title={action.title}
              subtitle={subtitleFor(action)}
              tag={tagFor(action)}
            />
          ))}
      </div>
    </section>
  );
}

function ProspectRow({ company, sector, fit, reason, match, contactName, email, phone, linkedin }: Prospect) {
  const { t } = useTranslation();
  const tone: Tone = fit >= 90 ? "success" : fit >= 80 ? "info" : "warning";
  const hasContact = contactName || email || phone || linkedin;
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{company}</p>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border tabular-nums ${toneClasses(tone)}`}
          >
            {fit}% {t("dashboard.fit")}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{sector}</p>
        <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2">
          <Sparkles className="h-3 w-3 inline-block mr-1 -mt-0.5 text-secondary" />
          {reason}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          {t("dashboard.match")} : <span className="text-secondary font-semibold">{match}</span>
        </p>
        {hasContact && (
          <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
            {contactName && (
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                {t("dashboard.bestContact")} : <span className="text-foreground font-medium normal-case">{contactName}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-secondary">
                  <Mail className="h-3 w-3" /> {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-secondary">
                  <Phone className="h-3 w-3" /> {phone}
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-secondary">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ProspectsStatus = "idle" | "loading" | "ready" | "error" | "missingProfile" | "noCompany";

function AIProspectsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { current } = useCompany();
  const analyze = useServerFn(analyzeProspects);
  const [status, setStatus] = useState<ProspectsStatus>("idle");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [errorKey, setErrorKey] = useState<string>("dashboard.prospectsAi.errorGeneric");

  const run = async (force: boolean) => {
    if (current.id === "all") {
      setStatus("noCompany");
      return;
    }
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({
        data: {
          language: safeLang,
          companyId: current.id,
          force,
        },
      });
      setProspects(result.prospects);
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("MISSING_PROFILE")) {
        setStatus("missingProfile");
        return;
      }
      if (msg.includes("RATE_LIMIT")) setErrorKey("dashboard.prospectsAi.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("dashboard.prospectsAi.errorCredits");
      else setErrorKey("dashboard.prospectsAi.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em] inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          {t("dashboard.aiSuggested")}
        </h2>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={status === "loading"}
          className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} />
          {t("dashboard.refresh")}
        </button>
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {status === "loading" && (
          <div className="p-4 space-y-2 animate-pulse">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        )}

        {status === "noCompany" && (
          <p className="p-4 text-sm text-muted-foreground">
            {t("dashboard.prospectsAi.noCompany")}
          </p>
        )}

        {status === "missingProfile" && (
          <div className="p-4 text-sm text-muted-foreground">
            <p>{t("dashboard.prospectsAi.missingProfile")}</p>
            <Link to="/settings" className="text-secondary font-semibold hover:underline">
              {t("dashboard.prospectsAi.missingProfileCta")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 flex items-start gap-2 text-sm text-error">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t(errorKey)}</span>
          </div>
        )}

        {status === "ready" && prospects.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">{t("dashboard.prospectsAi.empty")}</p>
        )}

        {status === "ready" && prospects.length > 0 && (
          <>
            <div className="divide-y divide-border">
              {prospects.map((p, i) => (
                <ProspectRow key={`${p.company}-${i}`} {...p} />
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
              {t("dashboard.prospectsAi.disclaimer")}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type AIStatus = "idle" | "loading" | "ready" | "error";

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { current } = useCompany();
  const analyze = useServerFn(analyzeDashboard);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("dashboard.ai.errorGeneric");

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
      if (msg.includes("RATE_LIMIT")) setErrorKey("dashboard.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("dashboard.ai.errorCredits");
      else setErrorKey("dashboard.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  return (
    <div className="k-card p-6 mb-8 border-l-4 border-l-secondary">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] tracking-tight">{t("dashboard.ai.title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.ai.disclaimer")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? t("dashboard.ai.loading") : t("dashboard.ai.regenerate")}
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
