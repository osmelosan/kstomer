import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Plus,
  Mail,
  FileText,
  MoreHorizontal,
  TrendingUp,
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
          <SectionHeader title="Dernières opportunités" cta="Pipeline complet" />
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <Th>Nom</Th>
                    <Th>Montant</Th>
                    <Th>Statut</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <OppRow
                    title="Refonte identité visuelle"
                    company="Agence Créa Loft"
                    amount="3 200 €"
                    status={{ label: "GAGNÉ", tone: "success" }}
                  />
                  <OppRow
                    title="Consulting UX / UI"
                    company="TechnoStream"
                    amount="1 850 €"
                    status={{ label: "EN NÉGO", tone: "info" }}
                  />
                  <OppRow
                    title="Pack Audit SEO"
                    company="E-Shop Direct"
                    amount="950 €"
                    status={{ label: "À CONTACTER", tone: "warning" }}
                  />
                </tbody>
              </table>
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
