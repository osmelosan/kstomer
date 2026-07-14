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
  Link2,
  X,
  Loader2,
  CloudUpload,
  Trash2,
  PenLine,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    notes,
    loading,
    updateReseller,
    addNote,
    updateNote,
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
  const [savingNote, setSavingNote] = useState(false);
  const [linkTarget, setLinkTarget] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [savingNoteEdit, setSavingNoteEdit] = useState(false);

  const profileAutosave = useAutosave(draft, async (value) => {
    if (!value) return;
    await updateReseller(value);
  });

  async function submitNote() {
    if (!noteDraft.trim() || savingNote) return;
    setSavingNote(true);
    try {
      await addNote(noteDraft);
      setNoteDraft("");
    } finally {
      setSavingNote(false);
    }
  }

  function startEditingNote(noteId: string, text: string) {
    setEditingNoteId(noteId);
    setEditingNoteText(text);
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditingNoteText("");
  }

  async function submitNoteEdit() {
    if (!editingNoteId || !editingNoteText.trim() || savingNoteEdit) return;
    setSavingNoteEdit(true);
    try {
      await updateNote(editingNoteId, editingNoteText);
      cancelEditingNote();
    } finally {
      setSavingNoteEdit(false);
    }
  }

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
                {notes.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    ({notes.length})
                  </span>
                )}
              </h2>
            </div>
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={t("contactDetail.notePlaceholder")}
              rows={4}
              className="text-sm"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={submitNote}
                disabled={!noteDraft.trim() || savingNote}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {t("contactDetail.saveNote")}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("contactDetail.notesEmpty")}
                </p>
              ) : (
                notes.map((n) =>
                  editingNoteId === n.id ? (
                    <div key={n.id} className="rounded-md border border-border p-3">
                      <Textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        rows={4}
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEditingNote}
                          className="h-8 px-3 rounded-md border border-input bg-card text-xs font-medium hover:bg-muted"
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          onClick={submitNoteEdit}
                          disabled={!editingNoteText.trim() || savingNoteEdit}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {savingNoteEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          {t("contactDetail.saveNote")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={n.id} className="group rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-xs text-muted-foreground">
                          {new Date(n.created_at).toLocaleString(i18nInstance.language)}
                          {n.updated_at && n.updated_at !== n.created_at && (
                            <span> · {t("contactDetail.noteEdited")}</span>
                          )}
                        </div>
                        <button
                          onClick={() => startEditingNote(n.id, n.note_text)}
                          aria-label={t("contactDetail.editNote")}
                          className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <PenLine className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{n.note_text}</p>
                    </div>
                  ),
                )
              )}
            </div>
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
