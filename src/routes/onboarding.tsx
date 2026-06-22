import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Personnalisez votre expérience — Kstomer" }],
  }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [taskReminders, setTaskReminders] = useState(true);
  const [prospect, setProspect] = useState(false);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          Kstomer
        </Link>
        <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AIDE <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider mb-3">
          <span className="text-secondary">CONFIGURATION</span>
          <span className="text-muted-foreground">Étape 2 sur 3</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary/15 overflow-hidden">
          <div className="h-full bg-secondary" style={{ width: "66%" }} />
        </div>

        <div className="mt-10 rounded-2xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-10">
          <h1 className="text-[28px] font-bold tracking-tight">
            Personnalisez votre expérience
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configurez votre profil pour une utilisation optimale de Kstomer.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Nom complet
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Jean Dupont"
                className="w-full h-12 px-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Votre rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Sélectionnez votre profil</option>
                <option>Solopreneur</option>
                <option>Consultant</option>
                <option>Agence</option>
                <option>Reseller</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4">Préférences de notifications</h3>

              <ToggleRow
                label="Rappels de tâches"
                hint="Soyez notifié de vos échéances quotidiennes."
                checked={taskReminders}
                onChange={setTaskReminders}
              />
              <ToggleRow
                label="Opportunités de prospection"
                hint="Alertes lors de nouvelles interactions clients."
                checked={prospect}
                onChange={setProspect}
              />
            </div>

            <button
              onClick={() => nav({ to: "/dashboard" })}
              className="mt-4 flex items-center justify-center gap-3 w-full h-13 py-4 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
            >
              Continuer la configuration <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => nav({ to: "/dashboard" })}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Passer cette étape
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Vos données sont sécurisées et ne seront jamais partagées.
        </p>
      </div>
    </main>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-sm text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
