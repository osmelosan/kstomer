import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  TrendingUp,
  Users,
  AlertCircle,
  Plus,
  Zap,
  Mail,
  Calendar,
  MessageSquare,
  Rocket,
  Leaf,
  Building2,
  Share2,
  FileText,
  Check,
  MoreVertical,
  History,
  HandHelping,
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
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nouveau contact
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <MetricCard
          label="Revenu mensuel"
          value="8 450,00 €"
          delta="+12.4%"
          icon={<TrendingUp className="h-4 w-4" />}
          deltaTone="success"
          footer="vs. mois dernier"
        />
        <MetricCard
          label="Abonnés actifs"
          value="142"
          icon={<Users className="h-4 w-4" />}
          progress={70}
        />
        <MetricCard
          label="Relances"
          value="12"
          critical
          footer={
            <span className="inline-flex items-center text-xs font-semibold rounded-md bg-[color:var(--color-danger-soft)] text-destructive px-3 py-2">
              3 actions immédiates requises
            </span>
          }
        />
      </div>

      <SectionHeader
        icon={<Zap className="h-5 w-5 text-warning" />}
        title="Actions Prioritaires"
        cta="Voir tout le flux"
      />

      <div className="space-y-3 mb-12">
        <ActionRow
          tag={{ label: "RETARD", tone: "destructive" }}
          title="Relance en retard : Jean Dupont"
          subtitle="Client SaaS Pro · Dernière interaction il y a 8 jours"
          icon={<History className="h-5 w-5 text-destructive" />}
          iconBg="bg-[color:var(--color-danger-soft)]"
          action={
            <Pill icon={<Mail className="h-4 w-4" />}>
              Envoyer un email de rappel
            </Pill>
          }
        />
        <ActionRow
          tag={{ label: "J-3", tone: "warning" }}
          title="Renouvellement proche : TechCorp"
          subtitle="Abonnement annuel Enterprise · 2 400 € / an"
          icon={<Calendar className="h-5 w-5 text-warning" />}
          iconBg="bg-warning-soft"
          action={
            <Pill icon={<HandHelping className="h-4 w-4" />}>
              Appeler pour faire le point sur la satisfaction
            </Pill>
          }
        />
        <ActionRow
          tag={{ label: "INACTIF 10J", tone: "neutral" }}
          title="Revendeur silencieux : Emilie Sales"
          subtitle="Partenaire Bronze · Pas d'enregistrement d'opportunité"
          icon={<MessageSquare className="h-5 w-5 text-muted-foreground" />}
          iconBg="bg-muted"
          action={
            <Pill icon={<MessageSquare className="h-4 w-4" />}>
              Proposer un point d'étape par message
            </Pill>
          }
        />
      </div>

      <SectionHeader
        icon={<Rocket className="h-5 w-5 text-secondary" />}
        title="Opportunités de Prospection"
      />
      <p className="text-sm text-muted-foreground mb-4">
        Aujourd'hui, vous pouvez proposer vos services à ces 2 entreprises dans
        votre secteur.
      </p>

      <div className="space-y-3">
        <ActionRow
          tag={{ label: "GREEN TECH", tone: "success" }}
          title="EcoSolutions"
          subtitle="Secteur local · Potentiel de collaboration élevé"
          icon={<Leaf className="h-5 w-5 text-success" />}
          iconBg="bg-success-soft"
          action={
            <Pill icon={<FileText className="h-4 w-4" />}>
              Envoyer une proposition personnalisée
            </Pill>
          }
          trailing={<MoreButton />}
        />
        <ActionRow
          tag={{ label: "SAAS BTP", tone: "info" }}
          title="BuildIt"
          subtitle="Ville voisine · En forte croissance"
          icon={<Building2 className="h-5 w-5 text-secondary" />}
          iconBg="bg-secondary/10"
          action={
            <Pill icon={<Share2 className="h-4 w-4" />}>
              Contacter via LinkedIn
            </Pill>
          }
          trailing={<MoreButton />}
        />
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  delta,
  deltaTone,
  icon,
  progress,
  footer,
  critical,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "warning";
  icon?: React.ReactNode;
  progress?: number;
  footer?: React.ReactNode;
  critical?: boolean;
}) {
  return (
    <div className="k-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="k-label">{label}</span>
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 ${
              deltaTone === "success"
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning-foreground"
            }`}
          >
            {icon}
            {delta}
          </span>
        ) : critical ? (
          <span className="h-2 w-2 rounded-full bg-destructive" />
        ) : (
          <span className="text-muted-foreground">{icon}</span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-[36px] font-bold tracking-tight leading-none">
          {value}
        </span>
        {critical && (
          <span className="text-destructive text-sm font-semibold">
            Critiques
          </span>
        )}
      </div>
      {typeof progress === "number" && (
        <div className="h-1.5 rounded-full bg-secondary/15 overflow-hidden">
          <div
            className="h-full bg-secondary"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {footer && (
        <div className="text-sm text-muted-foreground">{footer}</div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center gap-2 text-[20px] font-semibold tracking-tight">
        {icon}
        {title}
      </h2>
      {cta && (
        <button className="text-sm font-semibold text-secondary hover:underline">
          {cta}
        </button>
      )}
    </div>
  );
}

type Tone = "success" | "warning" | "destructive" | "info" | "neutral";

function tagClasses(tone: Tone) {
  switch (tone) {
    case "success":
      return "bg-success-soft text-success";
    case "warning":
      return "bg-warning-soft text-warning-foreground";
    case "destructive":
      return "bg-destructive text-destructive-foreground";
    case "info":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-foreground text-background";
  }
}

function ActionRow({
  tag,
  title,
  subtitle,
  action,
  icon,
  iconBg,
  trailing,
}: {
  tag: { label: string; tone: Tone };
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="k-card p-5 flex items-start gap-4">
      <div
        className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
          iconBg ?? "bg-muted"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center text-[11px] font-bold tracking-wider px-2 py-1 rounded-md ${tagClasses(
              tag.tone,
            )}`}
          >
            {tag.label}
          </span>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      <div className="shrink-0">
        {trailing ?? (
          <button className="h-9 w-9 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted">
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function MoreButton() {
  return (
    <button className="h-9 w-9 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted">
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button className="inline-flex items-center gap-2 rounded-md bg-secondary/10 text-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/15">
      {icon}
      {children}
    </button>
  );
}
