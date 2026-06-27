import { pageHead } from "@/lib/route-seo";
import i18nGlobal from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSubscription } from "@/hooks/use-subscription";
import { useEntitlement } from "@/hooks/use-entitlement";
import { listUsersWithRoles, setTesterRole } from "@/lib/admin.functions";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { getPlanByPriceId } from "@/lib/pricing-plans";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
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
  Plus,
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
import { useRevenueGoal } from "@/hooks/use-revenue-goal";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";


export const Route = createFileRoute("/_authenticated/settings")({
  head: () =>
    pageHead({
      routeKey: "settings",
      title: i18nGlobal.t("settings.metaTitle"),
      path: "/settings",
      noindex: true,
    }),
  component: SettingsPage,
});

type SectionKey = "profile" | "company" | "preferences" | "notifications" | "language" | "billing" | "security" | "integrations" | "admin";

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [reminders, setReminders] = useState(true);
  const [prospect, setProspect] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useEntitlement();

  const sections: { key: SectionKey; label: string }[] = [
    { key: "profile", label: t("settings.sections.profile") },
    { key: "company", label: t("settings.sections.company") },
    { key: "preferences", label: t("settings.sections.preferences") },
    { key: "notifications", label: t("settings.sections.notifications") },
    { key: "language", label: t("settings.sections.language") },
    { key: "billing", label: t("settings.sections.billing") },
    { key: "security", label: t("settings.sections.security") },
    { key: "integrations", label: t("settings.sections.integrations") },
    ...(isAdmin ? [{ key: "admin" as SectionKey, label: "Administration" }] : []),
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
          {activeSection === "company" && <CompanySection />}
          {activeSection === "preferences" && <PreferencesSection />}
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
          {activeSection === "admin" && isAdmin && <AdminSection />}


          {activeSection !== "profile" && activeSection !== "company" && activeSection !== "preferences" && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
              >
                {saving ? t("common.loading") : t("settings.save")}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileSection() {
  const { t } = useTranslation();
  const { user, profile } = useCurrentUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fullName =
      profile?.full_name ||
      (user?.user_metadata?.full_name as string | undefined) ||
      "";
    const parts = fullName.trim().split(/\s+/);
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setPhone(profile?.phone ?? "");
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const full_name = [firstName, lastName].filter(Boolean).join(" ");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, phone: phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(t("settings.saved") + " ✗");
    } else {
      toast.success(t("settings.saved"));
    }
  };

  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight mb-4">
        {t("settings.sections.profile")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label={t("settings.firstName")}
          value={firstName}
          onChange={(v) => setFirstName(v)}
        />
        <Field
          label={t("settings.lastName")}
          value={lastName}
          onChange={(v) => setLastName(v)}
        />
        <Field
          label={t("settings.email")}
          value={user?.email ?? ""}
          readOnly
        />
        <Field
          label={t("settings.phone")}
          value={phone}
          onChange={(v) => setPhone(v)}
          type="tel"
        />
      </div>
      <div className="flex justify-end mt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
        >
          {saving ? t("common.loading") : t("settings.save")}
        </button>
      </div>
    </div>
  );
}

function CompanySection() {
  const { t } = useTranslation();
  const { companies, loading, maxCompanies, createOrg, updateOrg, deleteOrg } = useCompany();
  const [drafts, setDrafts] = useState<Record<string, { name: string; address: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const atLimit = companies.length >= maxCompanies;

  const getDraft = (id: string, field: "name" | "address") => {
    return drafts[id]?.[field] ?? (companies.find((c) => c.id === id) as { id: string; name: string } | undefined)?.[field] ?? "";
  };

  const setDraft = (id: string, field: "name" | "address", value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { name: getDraft(id, "name"), address: getDraft(id, "address"), [field]: value },
    }));
  };

  const handleSave = async (id: string) => {
    setSaving((s) => ({ ...s, [id]: true }));
    await updateOrg(id, { name: getDraft(id, "name"), address: getDraft(id, "address") || null });
    setSaving((s) => ({ ...s, [id]: false }));
    toast.success(t("settings.saved"));
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await createOrg(newName.trim());
    setNewName("");
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (companies.length <= 1) return;
    await deleteOrg(id);
    toast.success(t("settings.saved"));
  };

  if (loading) {
    return <div className="k-card p-7 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      {companies.map((c) => (
        <div key={c.id} className="k-card p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label={t("settings.company.name")}
              value={getDraft(c.id, "name")}
              onChange={(v) => setDraft(c.id, "name", v)}
            />
            <Field
              label={t("settings.company.address")}
              value={getDraft(c.id, "address")}
              onChange={(v) => setDraft(c.id, "address", v)}
            />
          </div>
          <div className="flex justify-between items-center mt-5">
            <button
              onClick={() => handleDelete(c.id)}
              disabled={companies.length <= 1}
              className="text-sm text-destructive hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("settings.company.delete")}
            </button>
            <button
              onClick={() => handleSave(c.id)}
              disabled={saving[c.id]}
              className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
            >
              {saving[c.id] ? t("common.loading") : t("settings.save")}
            </button>
          </div>
        </div>
      ))}

      {atLimit && maxCompanies === 1 && (
        <p className="text-sm text-muted-foreground px-1">{t("settings.company.upgradeHint")}</p>
      )}

      {!atLimit && (
        <div className="k-card p-7">
          <h3 className="text-[15px] font-semibold mb-4">{t("settings.company.addCompany")}</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("settings.company.namePlaceholder")}
              className="flex-1 h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="h-11 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {adding ? t("common.loading") : t("settings.company.addCompany")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreferencesSection() {
  const { t } = useTranslation();
  const { goal, setGoal } = useRevenueGoal();
  const [value, setValue] = useState<string>(String(goal));

  useEffect(() => {
    setValue(String(goal));
  }, [goal]);

  const onSave = () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("—");
      return;
    }
    setGoal(Math.round(n));
    toast.success(t("settings.preferences.saved"));
  };

  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight mb-4">
        {t("settings.preferences.title")}
      </h3>
      <div className="max-w-sm space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          {t("settings.preferences.revenueGoalLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            step={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 h-10 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            onClick={onSave}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
          >
            {t("settings.preferences.save")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("settings.preferences.revenueGoalHelp")}
        </p>
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
  const { subscription, loading, isActive } = useSubscription();
  const [opening, setOpening] = useState(false);

  const planName = subscription
    ? (getPlanByPriceId(subscription.price_id)?.name ?? subscription.price_id)
    : null;

  const openPortal = async () => {
    setOpening(true);
    try {
      const result = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/settings`,
        },
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        window.open(result.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur");
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight">
        {t("settings.billing.currentPlan")}
      </h3>

      {loading ? (
        <p className="mt-3 text-sm text-muted-foreground">…</p>
      ) : isActive && subscription ? (
        <>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase">
              {planName}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
              {subscription.status}
            </span>
          </div>
          {subscription.current_period_end && (
            <p className="mt-3 text-sm text-muted-foreground">
              {subscription.cancel_at_period_end
                ? "Accès jusqu'au "
                : `${t("settings.billing.nextCharge")} : `}
              <span className="font-semibold text-foreground">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={openPortal}
              disabled={opening}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
            >
              {opening ? "…" : "Gérer la facturation"}
            </button>
            <Link
              to="/pricing"
              className="h-9 px-4 rounded-md border border-border text-sm font-semibold inline-flex items-center"
            >
              {t("settings.billing.changePlan")}
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun abonnement actif. Choisissez un plan pour débloquer toutes les fonctionnalités.
          </p>
          <Link
            to="/pricing"
            className="mt-5 inline-flex items-center h-10 px-5 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90"
          >
            Voir les tarifs
          </Link>
        </>
      )}
    </div>
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
                  type="button"
                  onClick={!it.connected ? () => toast(t("settings.integrations.comingSoon")) : undefined}
                  className={cn(
                    "mt-3 h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5",
                    it.connected
                      ? "border border-border text-foreground hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
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

function Field({
  label,
  defaultValue,
  value,
  onChange,
  readOnly,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        className={`w-full h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none${readOnly ? " opacity-60 cursor-not-allowed" : ""}`}
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




function AdminSection() {
  const [users, setUsers] = useState<Array<{ id: string; email: string | null; full_name: string | null; is_tester: boolean; is_admin: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    const res = await listUsersWithRoles();
    if ("error" in res) {
      toast.error(res.error);
      setUsers([]);
    } else {
      setUsers(res.users);
    }
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);


  const toggle = async (u: { id: string; is_tester: boolean }) => {
    setBusy(u.id);
    const res = await setTesterRole({ data: { targetUserId: u.id, enabled: !u.is_tester } });
    setBusy(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_tester: !u.is_tester } : x)));
    toast.success(!u.is_tester ? "Rôle Tester accordé" : "Rôle Tester retiré");
  };

  const filtered = users.filter((u) => {
    const q = filter.toLowerCase();
    return !q || (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="k-card p-7">
      <h3 className="text-[18px] font-semibold tracking-tight">Administration — Testeurs</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Les comptes testeurs ont accès complet à l'application sans abonnement actif.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Rechercher email ou nom…"
          className="flex-1 h-10 px-3 rounded-md bg-muted border border-transparent text-sm focus:outline-none focus:bg-card focus:border-input"
        />
        <button onClick={reload} className="h-10 px-4 rounded-md border border-border text-sm font-semibold">
          Rafraîchir
        </button>
      </div>
      <div className="mt-5 divide-y divide-border border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground text-center">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">Aucun utilisateur.</div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4 bg-card">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{u.full_name || u.email || u.id}</div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                <div className="mt-1 flex gap-1.5">
                  {u.is_admin && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Admin</span>
                  )}
                  {u.is_tester && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary">Tester</span>
                  )}
                </div>
              </div>
              <Switch
                checked={u.is_tester}
                disabled={busy === u.id || u.is_admin}
                onCheckedChange={() => toggle(u)}
              />
            </div>
          ))
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Astuce : pour vous accorder le rôle admin la première fois, utilisez la console de la base de données :
        <code className="ml-1 px-1.5 py-0.5 rounded bg-muted">INSERT INTO public.user_roles (user_id, role) VALUES ('VOTRE_UUID', 'admin');</code>
      </p>
    </div>
  );
}
