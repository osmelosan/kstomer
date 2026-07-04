import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  TrendingUp,
  Store,
  Award,
  Activity,
  Info,
  Pencil,
  Check,
  History,
  RotateCcw,
  Link2,
  X,
  Loader2,
  CloudUpload,
  Trash2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutosave, type AutosaveStatus } from "@/hooks/use-autosave";
import { useReseller } from "@/hooks/use-reseller";
import { useContacts } from "@/hooks/use-contacts";
import { tierFor } from "@/hooks/use-resellers";

export const Route = createFileRoute("/_authenticated/resellers/$id")({
  head: ({ params }) =>
    pageHead({
      routeKey: "resellers",
      title: i18n.t("resellers.title"),
      path: `/resellers/${params.id}`,
      noindex: true,
    }),
  component: ResellerDetail,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function ResellerDetail() {
  const { id } = useParams({ from: "/_authenticated/resellers/$id" });
  const nav = useNavigate();
  const { t, i18n: i18nInstance } = useTranslation();
  const {
    reseller,
    note,
    noteHistory,
    loading,
    updateReseller,
    saveNote,
    restoreVersion,
    linkContact,
    unlinkContact,
    archiveReseller,
  } = useReseller(id);
  const { contacts } = useContacts();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    confidence_level: number | null;
  } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTouched, setNoteTouched] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const profileAutosave = useAutosave(draft, async (value) => {
    if (!value) return;
    await updateReseller(value);
  });
  const noteAutosave = useAutosave(noteTouched ? noteDraft : null, async (value) => {
    if (value === null) return;
    await saveNote(value);
  });

  if (loading) {
    return (
      <AppShell title="—">
        <div className="k-card p-6 text-sm text-muted-foreground">{t("common.loading")}</div>
      </AppShell>
    );
  }

  if (!reseller) {
    return (
      <AppShell title="—">
        <div className="k-card p-6 text-sm text-muted-foreground">
          {t("resellers.detail.notFound")}
        </div>
      </AppShell>
    );
  }

  const view = draft ?? reseller;
  const tier = tierFor(reseller.revenue);
  const dateFmt = new Intl.DateTimeFormat(i18nInstance.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const linkedIds = new Set(reseller.pipeline.map((d) => d.contact_id));
  const linkableContacts = contacts.filter((c) => !linkedIds.has(c.id));

  async function handleLink() {
    if (!linkTarget) return;
    setLinkError(null);
    const { error } = await linkContact(linkTarget);
    if (error) setLinkError(t(`resellers.detail.linkError.${error}`));
    else setLinkTarget("");
  }

  return (
    <AppShell title={view.name}>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/resellers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("resellers.detail.back")}
        </Link>
        <button
          onClick={() => setArchiveOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("resellers.archive")}
        </button>
      </div>

      {/* KPIs */}
      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Kpi
            label={t("resellers.detail.activeDeals")}
            value={String(reseller.dealsCount)}
            icon={<Briefcase className="h-4 w-4" />}
            info={t("resellers.detail.info.activeDeals")}
          />
          <Kpi
            label={t("resellers.detail.totalRevenue")}
            value={fmtMoney(reseller.revenue)}
            icon={<TrendingUp className="h-4 w-4" />}
            info={t("resellers.detail.info.revenue")}
          />
          <Kpi
            label={t("resellers.detail.tier")}
            value={t(`resellers.tiers.${tier}`)}
            icon={<Award className="h-4 w-4" />}
            info={t("resellers.detail.info.tier")}
          />
          <Kpi
            label={t("resellers.detail.health")}
            value={
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-5 rounded-full"
                    style={{
                      background:
                        i <= (reseller.confidence_level ?? 0)
                          ? "var(--color-secondary)"
                          : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                    }}
                  />
                ))}
              </div>
            }
            icon={<Activity className="h-4 w-4" />}
            info={t("resellers.detail.info.health")}
          />
        </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact column */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="k-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold tracking-tight flex items-center gap-2">
                <Store className="h-4 w-4 text-secondary" />
                {t("resellers.detail.contact")}
              </h2>
              <div className="flex items-center gap-2">
                <AutosaveIndicator
                  status={profileAutosave.status}
                  savedAt={profileAutosave.savedAt}
                />
                <button
                  onClick={() => {
                    if (editing) setEditing(false);
                    else {
                      setDraft({
                        name: reseller.name,
                        company: reseller.company,
                        email: reseller.email,
                        phone: reseller.phone,
                        confidence_level: reseller.confidence_level,
                      });
                      setEditing(true);
                    }
                  }}
                  className="h-8 w-8 grid place-items-center rounded-md border border-input bg-card hover:bg-muted"
                  aria-label={editing ? t("contactDetail.save") : t("contactDetail.editProfile")}
                >
                  {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3 text-sm">
                <EditField
                  label={t("resellers.detail.contactPerson")}
                  value={view.name}
                  onChange={(v) => setDraft({ ...view, name: v })}
                />
                <EditField
                  label={t("resellers.new.company")}
                  value={view.company ?? ""}
                  onChange={(v) => setDraft({ ...view, company: v || null })}
                />
                <EditField
                  label={t("resellers.detail.email")}
                  value={view.email ?? ""}
                  onChange={(v) => setDraft({ ...view, email: v || null })}
                />
                <EditField
                  label={t("resellers.detail.phone")}
                  value={view.phone ?? ""}
                  onChange={(v) => setDraft({ ...view, phone: v || null })}
                />
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
                    {t("resellers.detail.health")}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDraft({ ...view, confidence_level: i })}
                        className="h-3 flex-1 rounded-full transition-colors"
                        style={{
                          background:
                            i <= (view.confidence_level ?? 0)
                              ? "var(--color-secondary)"
                              : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <Field
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label={t("resellers.new.company")}
                  value={view.company ?? "—"}
                />
                <Field
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label={t("resellers.detail.email")}
                  value={
                    view.email ? (
                      <a href={`mailto:${view.email}`} className="text-secondary hover:underline">
                        {view.email}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  icon={<Phone className="h-3.5 w-3.5" />}
                  label={t("resellers.detail.phone")}
                  value={
                    view.phone ? (
                      <a href={`tel:${view.phone}`} className="text-secondary hover:underline">
                        {view.phone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label={t("resellers.detail.partnerSince")}
                  value={dateFmt.format(new Date(reseller.created_at))}
                />
              </dl>
            )}

            {!editing && (view.email || view.phone) && (
              <div className="flex gap-2 mt-5">
                {view.email && (
                  <a
                    href={`mailto:${view.email}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {t("resellers.detail.sendEmail")}
                  </a>
                )}
                {view.phone && (
                  <a
                    href={`tel:${view.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-border hover:bg-muted/60 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {t("resellers.detail.call")}
                  </a>
                )}
              </div>
            )}
          </section>

          <section className="k-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold tracking-tight">
                {t("resellers.detail.notes")}
              </h2>
              <div className="flex items-center gap-2">
                <AutosaveIndicator status={noteAutosave.status} savedAt={noteAutosave.savedAt} />
                <button
                  onClick={() => setVersionsOpen(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-card text-xs hover:bg-muted"
                >
                  <History className="h-3.5 w-3.5" />
                  {noteHistory.length > 0 && <span>({noteHistory.length})</span>}
                </button>
              </div>
            </div>
            <Textarea
              value={noteTouched ? noteDraft : (note?.note_text ?? "")}
              onChange={(e) => {
                setNoteTouched(true);
                setNoteDraft(e.target.value);
              }}
              rows={6}
              className="text-sm"
            />
          </section>
        </aside>

        {/* Pipeline */}
        <section className="lg:col-span-2 k-card p-6">
          <h2 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-secondary" />
            {t("resellers.detail.pipeline")}
          </h2>

          {reseller.pipeline.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">
              {t("resellers.detail.pipelineEmpty")}
            </p>
          ) : (
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left py-2 pr-3">{t("resellers.detail.dealName")}</th>
                    <th className="text-left py-2 pr-3">{t("resellers.detail.stage")}</th>
                    <th className="text-left py-2 pr-3">{t("resellers.detail.amount")}</th>
                    <th className="text-right py-2" />
                  </tr>
                </thead>
                <tbody>
                  {reseller.pipeline.map((d) => (
                    <tr key={d.contact_id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-3 font-medium">
                        <Link
                          to="/contacts/$id"
                          params={{ id: d.contact_id }}
                          className="hover:text-secondary hover:underline"
                        >
                          {d.contact_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                          {t(`contacts.stages.${d.stage}`)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-semibold">
                        {d.deal_value ? fmtMoney(d.deal_value) : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => unlinkContact(d.contact_id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              {t("resellers.detail.linkContact")}
            </label>
            <div className="flex gap-2">
              <Select value={linkTarget} onValueChange={setLinkTarget}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("resellers.detail.selectContact")} />
                </SelectTrigger>
                <SelectContent>
                  {linkableContacts.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                      {t("resellers.detail.noAvailableContacts")}
                    </div>
                  ) : (
                    linkableContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.contact_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={handleLink}
                disabled={!linkTarget}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" /> {t("resellers.detail.link")}
              </button>
            </div>
            {linkError && <p className="mt-2 text-xs text-destructive">{linkError}</p>}
          </div>
        </section>
      </div>

      {/* Versions sheet */}
      <Sheet open={versionsOpen} onOpenChange={setVersionsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("contactDetail.versions.title")}</SheetTitle>
            <SheetDescription>{t("contactDetail.versions.current")}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="rounded-md border border-secondary/30 bg-secondary/5 p-4">
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                {t("contactDetail.versions.current")}
              </div>
              <p className="text-sm whitespace-pre-wrap">{note?.note_text ?? ""}</p>
            </div>
            {noteHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("contactDetail.versions.empty")}
              </p>
            ) : (
              noteHistory.map((v) => (
                <div key={v.id} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.edited_at).toLocaleString(i18nInstance.language)}
                    </div>
                    <button
                      onClick={() => {
                        restoreVersion(v);
                        setVersionsOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("contactDetail.versions.restore")}
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {v.previous_text}
                  </p>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("resellers.archiveTitle", { name: reseller.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("resellers.archiveBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await archiveReseller();
                nav({ to: "/resellers" });
              }}
            >
              {t("resellers.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  icon,
  info,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  info?: string;
}) {
  return (
    <div className="k-card p-5">
      <div className="flex items-center justify-between">
        <div className="k-label flex items-center gap-1">
          <span>{label}</span>
          {info ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={info}
                  className="inline-flex items-center text-muted-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-full"
                >
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                {info}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <div className="h-8 w-8 rounded-md bg-secondary/10 text-secondary grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="text-[22px] font-bold mt-2 tracking-tight">{value}</div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-0.5">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1">
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  );
}

function AutosaveIndicator({ status, savedAt }: { status: AutosaveStatus; savedAt: Date | null }) {
  const { t, i18n: i18nInst } = useTranslation();
  if (status === "idle") return null;
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudUpload className="h-3.5 w-3.5" />
        {t("contactDetail.autosave.pending")}
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t("contactDetail.autosave.saving")}
      </span>
    );
  }
  const time = savedAt
    ? savedAt.toLocaleTimeString(i18nInst.language, { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-success">
      <Check className="h-3.5 w-3.5" />
      {savedAt ? t("contactDetail.autosave.savedAt", { time }) : t("contactDetail.autosave.saved")}
    </span>
  );
}
