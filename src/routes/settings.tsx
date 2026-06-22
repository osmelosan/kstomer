import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Paramètres — Kstomer" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [reminders, setReminders] = useState(true);
  const [prospect, setProspect] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <AppShell title="Paramètres" subtitle="Personnalisez Kstomer pour votre activité.">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <nav className="space-y-1 text-sm">
          {["Profil", "Notifications", "Facturation", "Sécurité", "Intégrations"].map(
            (s, i) => (
              <button
                key={s}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  i === 0 ? "bg-secondary/10 text-secondary font-semibold" : "hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </nav>

        <div className="space-y-6">
          <div className="k-card p-7">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">
              Profil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nom complet" defaultValue="Thomas Melo" />
              <Field label="Email" defaultValue="thomas@kstomer.io" />
              <Field label="Société" defaultValue="Kstomer Lab" />
              <Field label="Fuseau horaire" defaultValue="Europe/Paris" />
            </div>
          </div>

          <div className="k-card p-7">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">
              Notifications
            </h3>
            <Toggle
              label="Rappels de tâches"
              hint="Recevez un récap chaque matin."
              value={reminders}
              onChange={setReminders}
            />
            <Toggle
              label="Opportunités de prospection"
              hint="Être alerté lorsqu'un prospect entre dans votre secteur."
              value={prospect}
              onChange={setProspect}
            />
            <Toggle
              label="Récap hebdomadaire"
              hint="Performance de votre activité chaque lundi."
              value={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </div>

          <div className="flex justify-end">
            <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
              Sauvegarder les modifications
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        defaultValue={defaultValue}
        className="w-full h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-sm text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
