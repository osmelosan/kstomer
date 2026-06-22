import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Plus,
  Mail,
  Phone,
  FileText,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
  Building2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: i18n.t("dashboard.metaTitle") }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  return (
    <AppShell
      title={t("dashboard.title")}
      subtitle={t("dashboard.subtitle")}
      actions={
        <Link
          to="/contacts/new"
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="h-4 w-4" /> {t("dashboard.newOpportunity")}
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          label={t("dashboard.revenue")}
          value="12 450,00 €"
          accent={{ tone: "success", label: t("dashboard.revenueDelta") }}
          progress={75}
          footer={t("dashboard.revenueGoal")}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <SectionHeader title={t("dashboard.priorityActions")} cta={t("dashboard.seeAll")} ctaTo="/tasks" />
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-card">
            <ActionRow
              icon={<Mail className="h-5 w-5 text-muted-foreground" />}
              title={t("dashboard.actions.followUp")}
              subtitle={t("dashboard.actions.followUpSub")}
              tag={{ label: t("dashboard.tags.urgent"), tone: "warning" }}
            />
            <ActionRow
              icon={<FileText className="h-5 w-5 text-muted-foreground" />}
              title={t("dashboard.actions.finalize")}
              subtitle={t("dashboard.actions.finalizeSub")}
              tag={{ label: t("dashboard.tags.todo"), tone: "info" }}
            />
            <ActionRow
              icon={<Mail className="h-5 w-5 text-muted-foreground" />}
              title={t("dashboard.actions.late")}
              subtitle={t("dashboard.actions.lateSub")}
              tag={{ label: t("dashboard.tags.late"), tone: "danger" }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em] inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              {t("dashboard.aiSuggested")}
            </h2>
            <button className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> {t("dashboard.refresh")}
            </button>
          </div>
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="divide-y divide-border">
              <ProspectRow
                company="Studio Maelis"
                sector={t("dashboard.prospects.maelisSector")}
                fit={94}
                reason={t("dashboard.prospects.maelisReason")}
                match={t("dashboard.prospects.maelisMatch")}
                contactName="Camille Roux — Directrice"
                email="camille@studiomaelis.fr"
                phone="+33 6 12 34 56 78"
              />
              <ProspectRow
                company="Northgate Logistics"
                sector={t("dashboard.prospects.northgateSector")}
                fit={87}
                reason={t("dashboard.prospects.northgateReason")}
                match={t("dashboard.prospects.northgateMatch")}
                contactName="Marc Delvaux — Head of Design"
                email="m.delvaux@northgate.io"
                phone="+33 6 98 76 54 32"
              />
              <ProspectRow
                company="Boulangerie Lumen"
                sector={t("dashboard.prospects.bakerySector")}
                fit={79}
                reason={t("dashboard.prospects.bakeryReason")}
                match={t("dashboard.prospects.bakeryMatch")}
                contactName="Inès Marchand — Fondatrice"
                email="ines@lumen-bakery.fr"
                phone="+33 7 22 11 33 44"
              />

            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
              {t("dashboard.updatedAgo")}
            </div>
          </div>
        </section>
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
          <span className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${toneClasses(accent.tone)}`}>
            {accent.label}
          </span>
        )}
      </div>
      <p className="text-[30px] font-bold leading-tight mt-2 tabular-nums tracking-tight">{value}</p>
      {typeof progress === "number" && (
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
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
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: { label: string; tone: Tone };
}) {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 group">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${toneClasses(tag.tone)}`}>
          {tag.label}
        </span>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-border rounded transition-all text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ProspectRow({
  company,
  sector,
  fit,
  reason,
  match,
}: {
  company: string;
  sector: string;
  fit: number;
  reason: string;
  match: string;
}) {
  const { t } = useTranslation();
  const tone: Tone = fit >= 90 ? "success" : fit >= 80 ? "info" : "warning";
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{company}</p>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border tabular-nums ${toneClasses(tone)}`}>
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
      </div>
      <button className="shrink-0 p-2 rounded-lg hover:bg-secondary hover:text-secondary-foreground text-muted-foreground transition-colors">
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
}
