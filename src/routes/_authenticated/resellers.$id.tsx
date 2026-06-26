import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { pageHead } from "@/lib/route-seo";
import { getResellerById, type Reseller } from "@/lib/mock-resellers";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  User,
  TrendingUp,
  Activity,
  Trophy,
  XCircle,
  CloudUpload,
  Check,
  Loader2,
} from "lucide-react";
import { useAutosave, type AutosaveStatus } from "@/hooks/use-autosave";

export const Route = createFileRoute("/_authenticated/resellers/$id")({
  loader: ({ params }): { reseller: Reseller } => {
    const reseller = getResellerById(params.id);
    if (!reseller) throw notFound();
    return { reseller };
  },
  head: ({ loaderData }) =>
    pageHead({
      routeKey: "resellerDetail",
      title: i18n.t("resellers.detail.metaTitle", { name: loaderData?.reseller.name ?? "" }),
      path: `/resellers/${loaderData?.reseller.id ?? ""}`,
      noindex: true,
    }),
  component: ResellerDetail,
  errorComponent: ResellerError,
  notFoundComponent: ResellerNotFound,
});

function ResellerError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <AppShell title={t("resellers.detail.notFoundTitle")}>
      <div className="k-card p-8 text-center">
        <p className="text-muted-foreground mb-4">{t("resellers.detail.notFoundBody")}</p>
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60"
        >
          {t("resellers.detail.back")}
        </button>
      </div>
    </AppShell>
  );
}

function ResellerNotFound() {
  const { t } = useTranslation();
  return (
    <AppShell title={t("resellers.detail.notFoundTitle")}>
      <div className="k-card p-8 text-center">
        <p className="text-muted-foreground mb-4">{t("resellers.detail.notFoundBody")}</p>
        <Link
          to="/resellers"
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("resellers.detail.back")}
        </Link>
      </div>
    </AppShell>
  );
}

function tierClass(tier: Reseller["tier"]) {
  if (tier === "Gold") return "bg-warning-soft text-warning-foreground";
  if (tier === "Silver") return "bg-muted text-foreground";
  return "bg-secondary/10 text-secondary";
}

function ResellerDetail() {
  const { reseller } = Route.useLoaderData() as { reseller: Reseller };
  const { t, i18n: i18nInst } = useTranslation();
  const storageKey = `reseller-notes:${reseller.id}`;

  const [note, setNote] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNote(window.localStorage.getItem(storageKey) ?? "");
  }, [storageKey]);

  const noteAutosave = useAutosave(note, (next) => {
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, next);
  });

  const initials = reseller.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(i18nInst.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AppShell title={reseller.name}>
      {/* Back link */}
      <div className="mb-4">
        <Link
          to="/resellers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("resellers.detail.back")}
        </Link>
      </div>

      {/* Header */}
      <div className="k-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="h-16 w-16 rounded-xl bg-secondary/10 text-secondary grid place-items-center text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-[24px] font-bold tracking-tight">{reseller.name}</h1>
              <span
                className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${tierClass(
                  reseller.tier,
                )}`}
              >
                {reseller.tier}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {reseller.segment} · {reseller.accountManager}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href={`mailto:${reseller.email}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <Mail className="h-3.5 w-3.5" />
                {t("resellers.detail.actions.email")}
              </a>
              <a
                href={`tel:${reseller.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60"
              >
                <Phone className="h-3.5 w-3.5" />
                {t("resellers.detail.actions.call")}
              </a>
              <a
                href={reseller.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60"
              >
                <Globe className="h-3.5 w-3.5" />
                {t("resellers.detail.actions.website")}
              </a>
              <Link
                to="/kanban"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted/60"
              >
                <Activity className="h-3.5 w-3.5" />
                {t("resellers.detail.actions.viewPipeline")}
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs inline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <KpiInline
            label={t("resellers.detail.kpis.activeDeals")}
            value={String(reseller.activeDeals.length)}
            icon={<Briefcase className="h-3.5 w-3.5" />}
          />
          <KpiInline
            label={t("resellers.detail.kpis.revenue")}
            value={reseller.revenue}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
          />
          <KpiInline
            label={t("resellers.detail.kpis.conversion")}
            value={reseller.conversionRate}
            icon={<Activity className="h-3.5 w-3.5" />}
          />
          <div>
            <div className="k-label flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              {t("resellers.detail.kpis.health")}
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="h-2 w-5 rounded-full"
                  style={{
                    background:
                      i <= reseller.health
                        ? "var(--color-secondary)"
                        : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active deals */}
          <section className="k-card p-6">
            <h2 className="font-semibold text-[15px] tracking-tight mb-4">
              {t("resellers.detail.sections.activeDeals")}
            </h2>
            {reseller.activeDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("resellers.detail.empty.activeDeals")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {reseller.activeDeals.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.stage} · {t("resellers.detail.labels.closeDate")}: {dateFmt(d.closeDate)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">{d.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* History */}
          <section className="k-card p-6">
            <h2 className="font-semibold text-[15px] tracking-tight mb-4">
              {t("resellers.detail.sections.history")}
            </h2>
            {reseller.closedDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("resellers.detail.empty.history")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {reseller.closedDeals.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{dateFmt(d.closedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">{d.amount}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          d.status === "won"
                            ? "bg-success-soft text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {d.status === "won" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {t(`resellers.detail.status.${d.status}`)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Notes */}
          <section className="k-card p-6">
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="font-semibold text-[15px] tracking-tight">
                {t("resellers.detail.sections.notes")}
              </h2>
              <NotesStatus status={noteAutosave.status} savedAt={noteAutosave.savedAt} />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("resellers.detail.notes.placeholder")}
              rows={5}
              className="w-full text-sm rounded-md border border-border bg-background p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="k-card p-6">
            <h2 className="font-semibold text-[15px] tracking-tight mb-4">
              {t("resellers.detail.sections.coordinates")}
            </h2>
            <dl className="space-y-3 text-sm">
              <Field icon={<User className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.primaryContact")}>
                {reseller.primaryContact}
              </Field>
              <Field icon={<Mail className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.email")}>
                <a className="text-secondary hover:underline" href={`mailto:${reseller.email}`}>
                  {reseller.email}
                </a>
              </Field>
              <Field icon={<Phone className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.phone")}>
                <a className="text-secondary hover:underline" href={`tel:${reseller.phone}`}>
                  {reseller.phone}
                </a>
              </Field>
              <Field icon={<Globe className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.website")}>
                <a
                  className="text-secondary hover:underline"
                  href={reseller.website}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {reseller.website.replace(/^https?:\/\//, "")}
                </a>
              </Field>
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.address")}>
                {reseller.address}
              </Field>
            </dl>
          </section>

          <section className="k-card p-6">
            <h2 className="font-semibold text-[15px] tracking-tight mb-4">
              {t("resellers.detail.sections.commercial")}
            </h2>
            <dl className="space-y-3 text-sm">
              <Field label={t("resellers.detail.labels.tier")}>
                <span
                  className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${tierClass(
                    reseller.tier,
                  )}`}
                >
                  {reseller.tier}
                </span>
              </Field>
              <Field label={t("resellers.detail.labels.segment")}>{reseller.segment}</Field>
              <Field label={t("resellers.detail.labels.accountManager")}>{reseller.accountManager}</Field>
              <Field icon={<Calendar className="h-3.5 w-3.5" />} label={t("resellers.detail.labels.onboardedAt")}>
                {dateFmt(reseller.onboardedAt)}
              </Field>
            </dl>
          </section>

          <section className="k-card p-6">
            <h2 className="font-semibold text-[15px] tracking-tight mb-4">
              {t("resellers.detail.sections.contacts")}
            </h2>
            <ul className="space-y-3">
              {reseller.contacts.map((c) => (
                <li key={c.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary/10 text-secondary grid place-items-center text-xs font-bold shrink-0">
                    {c.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <a href={`mailto:${c.email}`} className="text-secondary hover:underline truncate">
                        {c.email}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function KpiInline({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="k-label flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-[20px] font-bold mt-1 tracking-tight">{value}</div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="k-label flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}

function NotesStatus({ status, savedAt }: { status: AutosaveStatus; savedAt: Date | null }) {
  const { t, i18n: i18nInst } = useTranslation();
  if (status === "idle") return null;
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudUpload className="h-3.5 w-3.5" />
        {t("resellers.detail.notes.pending")}
      </span>
    );
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t("resellers.detail.notes.saving")}
      </span>
    );
  const time = savedAt
    ? savedAt.toLocaleTimeString(i18nInst.language, { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-success">
      <Check className="h-3.5 w-3.5" />
      {t("resellers.detail.notes.saved", { time })}
    </span>
  );
}
