import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Plus,
  Mail,
  FileText,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
  Building2,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Tableau de bord — Kstomer" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell
      title="Tableau de bord"
      subtitle="Bienvenue Julien. Voici vos priorités pour aujourd'hui."
      actions={
        <Link
          to="/contacts/new"
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="h-4 w-4" /> Nouvelle opportunité
        </Link>
      }
    >
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          label="Chiffre d'affaires"
          value="12 450,00 €"
          accent={{ tone: "success", label: "+12%" }}
          progress={75}
          footer="Objectif : 16 000 € ce mois"
        />
        <MetricCard
          label="Opportunités actives"
          value="24"
          accent={{ tone: "info", label: "8 nouvelles" }}
          footer={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +15% vs mois dernier
            </span>
          }
        />
        <MetricCard
          label="Taux de conversion"
          value="38,2%"
          accent={{ tone: "warning", label: "À surveiller" }}
          footer="Cycle moyen : 12 jours"
        />
      </div>

      {/* Two-column layout: actions + opportunities table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <SectionHeader title="Actions prioritaires" cta="Voir tout" />
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-card">
            <ActionRow
              icon={<Mail className="h-5 w-5 text-muted-foreground" />}
              title="Relancer Thomas Durand"
              subtitle="Devis envoyé il y a 3 jours"
              tag={{ label: "URGENT", tone: "warning" }}
            />
            <ActionRow
              icon={<FileText className="h-5 w-5 text-muted-foreground" />}
              title="Finaliser le contrat SaaS"
              subtitle="Client : StartUp Vision"
              tag={{ label: "À FAIRE", tone: "info" }}
            />
            <ActionRow
              icon={<Mail className="h-5 w-5 text-muted-foreground" />}
              title="Relance en retard : Jean Dupont"
              subtitle="Dernière interaction il y a 8 jours"
              tag={{ label: "RETARD", tone: "danger" }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em] inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              Prospects suggérés par l'IA
            </h2>
            <button className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Actualiser
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-4 py-2.5 bg-secondary/5 border-b border-border flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-secondary uppercase">
                Basé sur
              </span>
              <span className="text-[11px] text-foreground font-medium">
                Refonte identité visuelle · Consulting UX/UI · Audit SEO
              </span>
            </div>
            <div className="divide-y divide-border">
              <ProspectRow
                company="Studio Maelis"
                sector="Marque cosmétique D2C · 12 employés"
                fit={94}
                reason="Refonte de site annoncée sur LinkedIn la semaine dernière"
                match="Refonte identité"
              />
              <ProspectRow
                company="Northgate Logistics"
                sector="SaaS B2B logistique · 45 employés"
                fit={87}
                reason="Levée de fonds Série A — recrute un Head of Design"
                match="Consulting UX/UI"
              />
              <ProspectRow
                company="Boulangerie Lumen"
                sector="Réseau franchisé · 8 boutiques"
                fit={79}
                reason="Trafic organique en baisse de 22% sur 90 jours"
                match="Audit SEO"
              />
            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
              Mis à jour il y a 4 min · 3 nouveaux signaux détectés
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

/* ---------- Components ---------- */

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
      {footer && (
        <p className="text-[11px] text-muted-foreground mt-2">{footer}</p>
      )}
    </div>
  );
}

function SectionHeader({ title, cta }: { title: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold text-foreground uppercase tracking-[0.08em]">
        {title}
      </h2>
      {cta && (
        <button className="text-xs font-medium text-secondary hover:underline">
          {cta}
        </button>
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
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-border rounded transition-all text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
      {children}
    </th>
  );
}

function OppRow({
  title,
  company,
  amount,
  status,
}: {
  title: string;
  company: string;
  amount: string;
  status: { label: string; tone: Tone };
}) {
  return (
    <tr className="hover:bg-muted/50 transition-colors cursor-pointer">
      <td className="px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[10px] text-muted-foreground">{company}</p>
      </td>
      <td className="px-4 py-3 text-sm font-semibold tabular-nums">{amount}</td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${toneClasses(status.tone)}`}
        >
          {status.label}
        </span>
      </td>
    </tr>
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
  const tone: Tone = fit >= 90 ? "success" : fit >= 80 ? "info" : "warning";
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
            {fit}% FIT
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{sector}</p>
        <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2">
          <Sparkles className="h-3 w-3 inline-block mr-1 -mt-0.5 text-secondary" />
          {reason}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          Match : <span className="text-secondary font-semibold">{match}</span>
        </p>
      </div>
      <button className="shrink-0 p-2 rounded-lg hover:bg-secondary hover:text-secondary-foreground text-muted-foreground transition-colors">
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
}
