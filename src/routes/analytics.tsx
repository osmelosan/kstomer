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
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Kstomer" }] }),
  component: Analytics,
});

const REVENUE = [
  { m: "Jan", v: 22, p: 18 },
  { m: "Fév", v: 26, p: 20 },
  { m: "Mar", v: 24, p: 22 },
  { m: "Avr", v: 32, p: 25 },
  { m: "Mai", v: 36, p: 28 },
  { m: "Jun", v: 40, p: 32 },
  { m: "Jul", v: 42, p: 33 },
  { m: "Aoû", v: 45, p: 36 },
];

const SOURCES = [
  { label: "LinkedIn", value: 42 },
  { label: "Referral", value: 28 },
  { label: "Direct Search", value: 15 },
  { label: "Autres", value: 15 },
];

function Analytics() {
  return (
    <AppShell
      search={{ placeholder: "Rechercher…" }}
      title="Analytiques & Insights"
      subtitle="Visualisez la performance de votre activité en temps réel."
      actions={
        <div className="hidden md:inline-flex items-center rounded-md border border-input bg-card overflow-hidden text-sm ml-2">
          {["Derniers 30 jours", "Trimestre", "Année"].map((l, i) => (
            <button
              key={l}
              className={`h-10 px-3 ${
                i === 0
                  ? "bg-secondary text-secondary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Kpi
          label="Revenu Total"
          value="45 280,00 €"
          icon={<Wallet className="h-4 w-4" />}
          delta="+12.5%"
        />
        <Kpi
          label="Taux de Conversion"
          value="24.8%"
          icon={<MousePointerClick className="h-4 w-4" />}
          delta="+3.2%"
        />
        <Kpi
          label="Contacts Actifs"
          value="1 284"
          icon={<Users className="h-4 w-4" />}
          delta="vs mois dernier"
          neutral
        />
        <Kpi
          label="Opportunités"
          value="128 500 €"
          icon={<TrendingUp className="h-4 w-4" />}
          delta="+8k €"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="k-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-semibold tracking-tight">
              Croissance du Revenu
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Legend dot="var(--color-secondary)">Actuel</Legend>
              <Legend dot="color-mix(in oklab, var(--color-secondary) 30%, white)">
                Précédent
              </Legend>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-secondary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-secondary)"
                      stopOpacity={0}
                    />
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
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
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
        </div>

        <div className="k-card p-6">
          <h3 className="text-[18px] font-semibold tracking-tight mb-4">
            Sources de Leads
          </h3>
          <div className="space-y-4">
            {SOURCES.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{s.label}</span>
                  <span className="font-semibold">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/10 overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${s.value * 2.2}%`, maxWidth: "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-md bg-muted text-sm italic text-muted-foreground">
            “LinkedIn reste votre canal le plus performant avec un taux
            d'engagement 15% supérieur à la moyenne.”
          </div>
        </div>
      </div>

      <div className="k-card p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            Performance des segments
          </h3>
          <button className="text-secondary text-sm font-semibold hover:underline">
            Exporter CSV
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left py-3">Type de client</th>
              <th className="text-left py-3">Volume</th>
              <th className="text-left py-3">Conversion</th>
              <th className="text-left py-3">Valeur moyenne</th>
              <th className="text-left py-3">Score santé</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                t: "Entreprises SaaS",
                s: "Logiciels & Tech",
                v: 42,
                c: "32.4%",
                avg: "1 240 €",
                h: 4,
              },
              {
                t: "Solopreneurs",
                s: "Indépendants",
                v: 156,
                c: "18.2%",
                avg: "450 €",
                h: 3,
              },
              {
                t: "Agences Marketing",
                s: "Services B2B",
                v: 28,
                c: "26.1%",
                avg: "2 100 €",
                h: 5,
              },
            ].map((r) => (
              <tr key={r.t} className="border-b border-border last:border-0">
                <td className="py-4">
                  <div className="font-semibold">{r.t}</div>
                  <div className="text-xs text-muted-foreground">{r.s}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-primary text-primary-foreground p-7">
          <span className="inline-flex items-center text-[10px] font-bold tracking-wider px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
            <Lightbulb className="h-3 w-3 mr-1" /> OPPORTUNITÉ IA
          </span>
          <h3 className="mt-4 text-[22px] font-bold tracking-tight">
            Maximisez vos soirées
          </h3>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Nos données indiquent que vos prospects SaaS sont 40% plus
            susceptibles de répondre entre 18h et 19h30.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
            Planifier des rappels →
          </button>
        </div>

        <div className="rounded-2xl bg-warning-soft border border-warning/30 p-7">
          <AlertTriangle className="h-6 w-6 text-warning-foreground" />
          <h3 className="mt-3 text-[20px] font-bold tracking-tight">
            Renouvellements en approche
          </h3>
          <p className="mt-2 text-sm text-foreground/80">
            12 abonnements “Premium” arrivent à échéance dans les 30 prochains
            jours. Valeur à risque :{" "}
            <strong className="text-foreground">5 400 €</strong>.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-warning text-warning-foreground text-sm font-semibold">
            Voir la liste
          </button>
        </div>
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
        <div className="h-9 w-9 rounded-md bg-secondary/10 text-secondary grid place-items-center">
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1 ${
            neutral
              ? "bg-muted text-muted-foreground"
              : "bg-success-soft text-success"
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

function Legend({
  dot,
  children,
}: {
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}
