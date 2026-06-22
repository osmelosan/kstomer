import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [reminders, setReminders] = useState(true);
  const [prospect, setProspect] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [activeSection, setActiveSection] = useState<"profile" | "language" | "notifications">("profile");

  const sections = [
    { key: "profile", label: t("settings.sections.profile") },
    { key: "notifications", label: t("settings.sections.notifications") },
    { key: "language", label: t("settings.sections.language") },
    { key: "billing", label: t("settings.sections.billing") },
    { key: "security", label: t("settings.sections.security") },
    { key: "integrations", label: t("settings.sections.integrations") },
  ] as const;

  return (
    <AppShell title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <title>{t("settings.metaTitle")}</title>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <nav className="space-y-1 text-sm">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                if (s.key === "profile" || s.key === "language" || s.key === "notifications") {
                  setActiveSection(s.key);
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeSection === s.key ? "bg-secondary/10 text-secondary font-semibold" : "hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <div className="k-card p-7">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">
              {t("settings.sections.profile")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={t("settings.fullName")} defaultValue="Thomas Melo" />
              <Field label={t("settings.email")} defaultValue="thomas@kstomer.io" />
              <Field label={t("settings.company")} defaultValue="Kstomer Lab" />
              <Field label={t("settings.timezone")} defaultValue="Europe/Paris" />
            </div>
          </div>

          <div className="k-card p-7">
            <h3 className="text-[18px] font-semibold tracking-tight mb-1">
              {t("settings.language")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{t("settings.languageHint")}</p>
            <Select
              value={i18n.language.split("-")[0]}
              onValueChange={(v) => {
                i18n.changeLanguage(v as LanguageCode);
                if (typeof document !== "undefined") document.documentElement.lang = v;
              }}
            >
              <SelectTrigger className="w-full md:w-[280px]">
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
          </div>

          <div className="k-card p-7">
            <h3 className="text-[18px] font-semibold tracking-tight mb-4">
              {t("settings.sections.notifications")}
            </h3>
            <Toggle
              label={t("settings.reminders")}
              hint={t("settings.remindersHint")}
              value={reminders}
              onChange={setReminders}
            />
            <Toggle
              label={t("settings.prospect")}
              hint={t("settings.prospectHint")}
              value={prospect}
              onChange={setProspect}
            />
            <Toggle
              label={t("settings.weekly")}
              hint={t("settings.weeklyHint")}
              value={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </div>

          <div className="flex justify-end">
            <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
              {t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
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
