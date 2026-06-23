import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/Logo";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: i18n.t("onboarding.metaTitle") }] }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [taskReminders, setTaskReminders] = useState(true);
  const [prospect, setProspect] = useState(false);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="block" aria-label={t("onboarding.homeAria")}>
          <Logo variant="horizontal" theme="on-light" className="h-24" />
        </Link>
        <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("onboarding.help")} <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider mb-3">
          <span className="text-secondary">{t("onboarding.configuration")}</span>
          <span className="text-muted-foreground">{t("onboarding.step", { current: 2, total: 3 })}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary/15 overflow-hidden">
          <div className="h-full bg-secondary" style={{ width: "66%" }} />
        </div>

        <div className="mt-10 rounded-2xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-10">
          <h1 className="text-[28px] font-bold tracking-tight">{t("onboarding.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("onboarding.subtitle")}</p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">{t("onboarding.fullName")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onboarding.fullNamePlaceholder")}
                className="w-full h-12 px-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t("onboarding.role")}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">{t("onboarding.selectRole")}</option>
                <option>{t("onboarding.roles.solopreneur")}</option>
                <option>{t("onboarding.roles.consultant")}</option>
                <option>{t("onboarding.roles.agency")}</option>
                <option>{t("onboarding.roles.reseller")}</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4">{t("onboarding.notifPrefs")}</h3>

              <ToggleRow
                label={t("onboarding.taskReminders")}
                hint={t("onboarding.taskRemindersHint")}
                checked={taskReminders}
                onChange={setTaskReminders}
              />
              <ToggleRow
                label={t("onboarding.prospect")}
                hint={t("onboarding.prospectHint")}
                checked={prospect}
                onChange={setProspect}
              />
            </div>

            <button
              onClick={() => nav({ to: "/dashboard" })}
              className="mt-4 flex items-center justify-center gap-3 w-full h-13 py-4 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
            >
              {t("onboarding.continue")} <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => nav({ to: "/dashboard" })}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("onboarding.skip")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{t("onboarding.privacy")}</p>
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
