import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import i18nGlobal, { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useContacts } from "@/hooks/use-contacts";
import { CsvContactImport } from "@/components/CsvContactImport";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () =>
    pageHead({
      routeKey: "onboarding",
      title: i18nGlobal.t("onboarding.metaTitle"),
      path: "/onboarding",
      noindex: true,
    }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile } = useCurrentUser();
  const { importContacts } = useContacts();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [taskReminders, setTaskReminders] = useState(true);
  const [prospect, setProspect] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; role?: string }>({});

  function handleContinue() {
    const next: { name?: string; role?: string } = {};
    if (!name.trim()) next.name = t("onboarding.errors.nameRequired");
    if (!role) next.role = t("onboarding.errors.roleRequired");
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  }

  async function completeOnboarding() {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    nav({ to: "/dashboard" });
  }

  useEffect(() => {
    const fullName =
      profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || "";
    if (fullName) setName(fullName);
  }, [user, profile]);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <header className="flex items-center justify-between max-w-5xl mx-auto gap-4">
        <Link to="/" className="block" aria-label={t("onboarding.homeAria")}>
          <Logo variant="horizontal" theme="on-light" className="h-24" />
        </Link>
        <div className="flex items-center gap-4">
          <Select
            value={i18n.language.split("-")[0]}
            onValueChange={(v) => {
              i18n.changeLanguage(v as LanguageCode);
              if (typeof document !== "undefined") document.documentElement.lang = v;
            }}
          >
            <SelectTrigger className="w-[140px]" aria-label={t("settings.language")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("onboarding.help")} <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto mt-16">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider mb-3">
          <span className="text-secondary">{t("onboarding.configuration")}</span>
          <span className="text-muted-foreground">
            {t("onboarding.step", { current: step, total: 2 })}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary/15 overflow-hidden">
          <div className="h-full bg-secondary" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        <div className="mt-10 rounded-2xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-10">
          {step === 1 ? (
            <>
              <h1 className="text-[28px] font-bold tracking-tight">{t("onboarding.title")}</h1>
              <p className="mt-2 text-muted-foreground">{t("onboarding.subtitle")}</p>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t("onboarding.fullName")}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("onboarding.fullNamePlaceholder")}
                    aria-invalid={!!errors.name}
                    className={`w-full h-12 px-4 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      errors.name ? "border-destructive" : "border-input"
                    }`}
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">{t("onboarding.role")}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    aria-invalid={!!errors.role}
                    className={`w-full h-12 px-4 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      errors.role ? "border-destructive" : "border-input"
                    }`}
                  >
                    <option value="">{t("onboarding.selectRole")}</option>
                    <option>{t("onboarding.roles.solopreneur")}</option>
                    <option>{t("onboarding.roles.consultant")}</option>
                    <option>{t("onboarding.roles.agency")}</option>
                    <option>{t("onboarding.roles.reseller")}</option>
                  </select>
                  {errors.role && <p className="mt-1.5 text-xs text-destructive">{errors.role}</p>}
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
                  onClick={handleContinue}
                  className="mt-4 flex items-center justify-center gap-3 w-full h-13 py-4 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
                >
                  {t("onboarding.continue")} <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={completeOnboarding}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("onboarding.skip")}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> {t("onboarding.back")}
              </button>
              <h1 className="mt-4 text-[28px] font-bold tracking-tight">
                {t("onboarding.csvImport.title")}
              </h1>
              <p className="mt-2 text-muted-foreground">{t("onboarding.csvImport.subtitle")}</p>

              <div className="mt-8">
                <CsvContactImport
                  onImport={importContacts}
                  onSkip={completeOnboarding}
                  skipLabel={t("onboarding.csvImport.skip")}
                  onImported={completeOnboarding}
                />
              </div>
            </>
          )}
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
