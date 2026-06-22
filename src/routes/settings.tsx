import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import {
  CreditCard,
  Download,
  Monitor,
  Smartphone,
  Trash2,
  Calendar,
  Mail,
  MessageSquare,
  Zap,
  Webhook,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type SectionKey = "profile" | "notifications" | "language" | "billing" | "security" | "integrations";

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [reminders, setReminders] = useState(true);
  const [prospect, setProspect] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [saving, setSaving] = useState(false);

  const sections: { key: SectionKey; label: string }[] = [
    { key: "profile", label: t("settings.sections.profile") },
    { key: "notifications", label: t("settings.sections.notifications") },
    { key: "language", label: t("settings.sections.language") },
    { key: "billing", label: t("settings.sections.billing") },
    { key: "security", label: t("settings.sections.security") },
    { key: "integrations", label: t("settings.sections.integrations") },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(t("settings.saved"));
  };

  return (
    <AppShell title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <title>{t("settings.metaTitle")}</title>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <nav className="space-y-1 text-sm">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeSection === s.key ? "bg-secondary/10 text-secondary font-semibold" : "hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "language" && (
            <LanguageSection
              value={i18n.language.split("-")[0]}
              onChange={(v) => {
                i18n.changeLanguage(v as LanguageCode);
                if (typeof document !== "undefined") document.documentElement.lang = v;
              }}
            />
          )}
          {activeSection === "notifications" && (
            <NotificationsSection
              reminders={reminders}
              setReminders={setReminders}
              prospect={prospect}
              setProspect={setProspect}
              weeklyDigest={weeklyDigest}
              setWeeklyDigest={setWeeklyDigest}
            />
          )}
          {activeSection === "billing" && <BillingSection />}
          {activeSection === "security" && (
            <SecuritySection twoFA={twoFA} setTwoFA={setTwoFA} />
          )}
          {activeSection === "integrations" && <IntegrationsSection />}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
            >
              {saving ? t("common.loading") : t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileSection() {
  const { t } = useTranslation();
  return (
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
  );
}

function LanguageSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight mb-1">
        {t("settings.language")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{t("settings.languageHint")}</p>
      <Select value={value} onValueChange={onChange}>
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
  );
}

function NotificationsSection(props: {
  reminders: boolean;
  setReminders: (v: boolean) => void;
  prospect: boolean;
  setProspect: (v: boolean) => void;
  weeklyDigest: boolean;
  setWeeklyDigest: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight mb-4">
        {t("settings.sections.notifications")}
      </h3>
      <Toggle
        label={t("settings.reminders")}
        hint={t("settings.remindersHint")}
        value={props.reminders}
        onChange={props.setReminders}
      />
      <Toggle
        label={t("settings.prospect")}
        hint={t("settings.prospectHint")}
        value={props.prospect}
        onChange={props.setProspect}
      />
      <Toggle
        label={t("settings.weekly")}
        hint={t("settings.weeklyHint")}
        value={props.weeklyDigest}
        onChange={props.setWeeklyDigest}
      />
    </div>
  );
}

function BillingSection() {
  const { t } = useTranslation();
  const invoices = [
    { date: "01 Jun 2026", amount: "€29.00", id: "INV-2026-006" },
    { date: "01 May 2026", amount: "€29.00", id: "INV-2026-005" },
    { date: "01 Apr 2026", amount: "€29.00", id: "INV-2026-004" },
  ];
  return (
    <>
      <div className="k-card p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight">
              {t("settings.billing.currentPlan")}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">PRO</span>
              <span className="text-sm text-muted-foreground">€29 / {t("settings.billing.month")}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("settings.billing.nextCharge")}: <span className="font-semibold text-foreground">01 Jul 2026</span>
            </p>
          </div>
          <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
            {t("settings.billing.changePlan")}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-sm font-semibold mb-3">{t("settings.billing.paymentMethod")}</div>
          <div className="flex items-center gap-3 p-3 rounded-md border border-border">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-sm">
              <div className="font-medium">Visa •••• 4242</div>
              <div className="text-xs text-muted-foreground">{t("settings.billing.expires")} 08/28</div>
            </div>
            <button className="text-sm text-secondary font-medium hover:underline">{t("common.edit")}</button>
          </div>
        </div>
      </div>

      <div className="k-card p-7">
        <h3 className="text-[18px] font-semibold tracking-tight mb-4">
          {t("settings.billing.invoices")}
        </h3>
        <div className="divide-y divide-border">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">{inv.id}</div>
                <div className="text-xs text-muted-foreground">{inv.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{inv.amount}</span>
                <button className="flex items-center gap-1.5 text-secondary hover:underline">
                  <Download className="h-4 w-4" />
                  {t("settings.billing.download")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SecuritySection({ twoFA, setTwoFA }: { twoFA: boolean; setTwoFA: (v: boolean) => void }) {
  const { t } = useTranslation();
  const sessions = [
    { id: "1", device: "MacBook Pro — Paris", icon: Monitor, current: true, lastSeen: t("settings.security.activeNow") },
    { id: "2", device: "iPhone 15 — Paris", icon: Smartphone, current: false, lastSeen: "2h" },
  ];

  return (
    <>
      <div className="k-card p-7">
        <h3 className="text-[18px] font-semibold tracking-tight mb-4">
          {t("settings.security.changePassword")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t("settings.security.currentPassword")} type="password" />
          <div />
          <Field label={t("settings.security.newPassword")} type="password" />
          <Field label={t("settings.security.confirmPassword")} type="password" />
        </div>
      </div>

      <div className="k-card p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight">
              {t("settings.security.twoFactor")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{t("settings.security.twoFactorHint")}</p>
          </div>
          <Switch checked={twoFA} onCheckedChange={setTwoFA} />
        </div>
      </div>

      <div className="k-card p-7">
        <h3 className="text-[18px] font-semibold tracking-tight mb-4">
          {t("settings.security.activeSessions")}
        </h3>
        <div className="divide-y divide-border">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-muted grid place-items-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {s.device}
                      {s.current && (
                        <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px] font-bold">
                          {t("settings.security.thisDevice")}
                        </span>
                      )}

                    </div>
                    <div className="text-xs text-muted-foreground">{s.lastSeen}</div>
                  </div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => toast.success(t("settings.security.sessionClosed"))}
                    className="text-sm text-destructive hover:underline"
                  >
                    {t("settings.security.signOutSession")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="k-card p-7 border-destructive/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight text-destructive">
              {t("settings.security.deleteAccount")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{t("settings.security.deleteAccountHint")}</p>
          </div>
          <button className="h-9 px-4 rounded-md border border-destructive text-destructive text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors inline-flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </button>
        </div>
      </div>
    </>
  );
}

function IntegrationsSection() {
  const { t } = useTranslation();
  const integrations = [
    { id: "gcal", name: t("settings.integrations.googleCalendar"), desc: t("settings.integrations.googleCalendarDesc"), icon: Calendar, connected: true },
    { id: "gmail", name: t("settings.integrations.gmail"), desc: t("settings.integrations.gmailDesc"), icon: Mail, connected: true },
    { id: "slack", name: t("settings.integrations.slack"), desc: t("settings.integrations.slackDesc"), icon: MessageSquare, connected: false },
    { id: "zapier", name: t("settings.integrations.zapier"), desc: t("settings.integrations.zapierDesc"), icon: Zap, connected: false },
    { id: "webhooks", name: t("settings.integrations.webhooks"), desc: t("settings.integrations.webhooksDesc"), icon: Webhook, connected: false },
  ];

  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight mb-4">
        {t("settings.sections.integrations")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.id} className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <div className="h-10 w-10 rounded-md bg-muted grid place-items-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{it.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                <button
                  className={cn(
                    "mt-3 h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5",
                    it.connected
                      ? "border border-border text-foreground hover:bg-muted"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {it.connected && <Check className="h-3.5 w-3.5" />}
                  {it.connected ? t("settings.integrations.connected") : t("settings.integrations.connect")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
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



