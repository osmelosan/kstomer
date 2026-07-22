import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  BadgeCheck,
  FileText,
  Mail,
  Phone,
  Calendar,
  TagIcon,
  Briefcase,
  MoreHorizontal,
  Pencil,
  Check,
  Loader2,
  Trash2,
  PenLine,
  Copy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useContact } from "@/hooks/use-contact";
import { useCompanyNames } from "@/hooks/use-company-names";
import { CompanyCombobox } from "@/components/CompanyCombobox";
import { PhoneInput } from "@/components/PhoneInput";
import type { Contact, ContactStage } from "@/hooks/use-contacts";
import { joinContactName } from "@/lib/contact-name";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeContactHealth, draftFollowUp } from "@/lib/contact-ai.functions";
import { AiInsightCard, type AiInsightStatus } from "@/components/AiInsightCard";
import { ContactAccessCard } from "@/components/ContactAccessCard";

export const Route = createFileRoute("/_authenticated/contacts/$id")({
  head: ({ params }) =>
    pageHead({
      routeKey: "contactDetail",
      title: i18n.t("contactDetail.metaTitle"),
      path: `/contacts/${params.id}`,
      noindex: true,
    }),
  component: ContactDetails,
});

const STAGES: ContactStage[] = ["new_lead", "contacted", "proposal", "active", "at_risk"];

function ContactDetails() {
  const { id } = useParams({ from: "/_authenticated/contacts/$id" });
  const nav = useNavigate();
  const { t, i18n: i18nInst } = useTranslation();
  const {
    contact,
    notes,
    loading,
    updateContact,
    addNote,
    updateNote,
    archiveContact,
    deleteContact,
  } = useContact(id);
  const { companyNames } = useCompanyNames();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [savingNoteEdit, setSavingNoteEdit] = useState(false);

  const [profileSaveStatus, setProfileSaveStatus] = useState<ProfileSaveStatus>("idle");
  const [profileSavedAt, setProfileSavedAt] = useState<Date | null>(null);

  async function saveProfile() {
    if (!draft) return;
    setProfileSaveStatus("saving");
    try {
      await updateContact({
        first_name: draft.first_name,
        last_name: draft.last_name,
        contact_name: joinContactName(draft.first_name, draft.last_name),
        company_name: draft.company_name,
        email: draft.email,
        phone: draft.phone,
        stage: draft.stage,
        confidence_level: draft.confidence_level,
        renewal_date: draft.renewal_date,
      });
      setProfileSavedAt(new Date());
      setProfileSaveStatus("saved");
    } catch {
      setProfileSaveStatus("idle");
    }
  }

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

  if (!contact) {
    return (
      <AppShell title="—">
        <div className="k-card p-6 text-sm text-muted-foreground">
          {t("contactDetail.notFound")}
        </div>
      </AppShell>
    );
  }

  const view = draft ?? contact;
  const dateFmt = new Intl.DateTimeFormat(i18nInst.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renewalBadge = (() => {
    if (!view.renewal_date) return null;
    const days = Math.ceil(
      (new Date(view.renewal_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
    );
    if (days > 30) return null;
    if (days < 0) return { label: t("contactDetail.renewalOverdue"), overdue: true };
    if (days === 0) return { label: t("contactDetail.renewalToday"), overdue: false };
    return { label: t("contactDetail.renewalIn", { days }), overdue: false };
  })();

  function startEditing() {
    setDraft(contact);
    setProfileSaveStatus("idle");
    setEditing(true);
  }

  async function stopEditing() {
    await saveProfile();
    setEditing(false);
  }

  const initials = view.contact_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <AppShell title={t("contactDetail.title")}>
      <div className="mb-4">
        <Link to="/contacts" className="text-sm text-muted-foreground hover:text-foreground">
          {t("contactDetail.back")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* Header card */}
        <div className="k-card p-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-2xl font-bold text-muted-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={view.first_name}
                    placeholder={t("contactDetail.firstName")}
                    onChange={(e) =>
                      setDraft({
                        ...view,
                        first_name: e.target.value,
                        contact_name: joinContactName(e.target.value, view.last_name),
                      })
                    }
                    className="text-xl font-bold h-10 flex-1 min-w-[140px]"
                  />
                  <Input
                    value={view.last_name ?? ""}
                    placeholder={t("contactDetail.lastName")}
                    onChange={(e) =>
                      setDraft({
                        ...view,
                        last_name: e.target.value || null,
                        contact_name: joinContactName(view.first_name, e.target.value),
                      })
                    }
                    className="text-xl font-bold h-10 flex-1 min-w-[140px]"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[24px] font-bold tracking-tight break-words">
                    {view.contact_name}
                  </h2>
                  <StageBadge stage={view.stage} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {!editing && (
                <ProfileSaveIndicator status={profileSaveStatus} savedAt={profileSavedAt} />
              )}
              <button
                onClick={editing ? stopEditing : startEditing}
                disabled={profileSaveStatus === "saving"}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none ${
                  editing
                    ? "border border-input bg-card hover:bg-muted"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {editing ? (
                  profileSaveStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                {editing ? t("contactDetail.save") : t("contactDetail.editProfile")}
              </button>
              {!editing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={t("contactDetail.quickActions")}
                      className="h-10 w-10 grid place-items-center rounded-md border border-input bg-card hover:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={`mailto:${view.email}`}>
                        <Mail className="h-4 w-4" /> {t("contactDetail.sendEmail")}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`tel:${view.phone}`}>
                        <Phone className="h-4 w-4" /> {t("contactDetail.callPhone")}
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                      <FileText className="h-4 w-4" /> {t("contactDetail.archive")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> {t("contactDetail.deleteContact")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-border">
            <InfoField
              icon={<Mail className="h-4 w-4" />}
              label={t("contactDetail.workEmail")}
              value={view.email ?? "—"}
              editing={editing}
              onChange={(v) => setDraft({ ...view, email: v || null })}
              draftValue={view.email ?? ""}
            />
            <div>
              <div className="k-label mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("contactDetail.phone")}
              </div>
              {editing ? (
                <PhoneInput
                  value={view.phone ?? ""}
                  onChange={(v) => setDraft({ ...view, phone: v || null })}
                  className="h-9"
                />
              ) : (
                <div className="font-medium text-sm">{view.phone ?? "—"}</div>
              )}
            </div>
            <div>
              <div className="k-label mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t("contactDetail.company")}
              </div>
              {editing ? (
                <CompanyCombobox
                  value={view.company_name ?? ""}
                  onChange={(v) => setDraft({ ...view, company_name: v.trim() ? v : null })}
                  options={companyNames}
                  className="h-9"
                />
              ) : (
                <div className="font-medium text-sm">{view.company_name ?? "—"}</div>
              )}
            </div>
            <div>
              <InfoField
                icon={<Calendar className="h-4 w-4" />}
                label={t("contactDetail.renewalDate")}
                value={view.renewal_date ? dateFmt.format(new Date(view.renewal_date)) : "—"}
                editing={editing}
                onChange={(v) => setDraft({ ...view, renewal_date: v || null })}
                draftValue={view.renewal_date ? view.renewal_date.slice(0, 10) : ""}
                type="date"
              />
              {!editing && renewalBadge && (
                <div
                  className={cn(
                    "mt-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1",
                    renewalBadge.overdue
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning-soft text-warning-foreground",
                  )}
                >
                  {renewalBadge.label}
                </div>
              )}
            </div>
            <div>
              <div className="k-label mb-2 flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5" /> {t("contactDetail.status")}
              </div>
              {editing ? (
                <Select
                  value={view.stage}
                  onValueChange={(v) => setDraft({ ...view, stage: v as ContactStage })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`contacts.stages.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StageBadge stage={view.stage} />
              )}
            </div>

            {/* Confidence */}
            <div className="md:col-span-2">
              <div className="k-label mb-3">{t("contactDetail.confidenceLevel")}</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!editing}
                    onClick={() => editing && setDraft({ ...view, confidence_level: i })}
                    className="h-3 flex-1 rounded-full transition-colors"
                    style={{
                      background:
                        i <= (view.confidence_level ?? 0)
                          ? "var(--color-secondary)"
                          : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                      cursor: editing ? "pointer" : "default",
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 text-secondary font-semibold text-sm">
                {view.confidence_level
                  ? `${view.confidence_level} / 5`
                  : t("contactDetail.noConfidence")}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t("contactDetail.meta.created", {
                date: dateFmt.format(new Date(contact.created_at)),
              })}
            </span>
            {contact.last_contact_date && (
              <span>
                {t("contactDetail.meta.lastInteraction", {
                  date: dateFmt.format(new Date(contact.last_contact_date)),
                })}
              </span>
            )}
          </div>
        </div>

        {/* AI relationship health */}
        <ContactHealthCard contactId={contact.id} onDraftClick={() => setDraftOpen(true)} />

        {/* Nuki smart lock access */}
        <ContactAccessCard contactId={contact.id} />

        {/* Notes */}
        <div className="k-card p-8">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="flex items-center gap-2 text-[20px] font-semibold">
              <FileText className="h-5 w-5 text-secondary" />
              {t("contactDetail.projectNotes")}
              {notes.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({notes.length})</span>
              )}
            </h3>
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
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("contactDetail.saveNote")}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("contactDetail.notesEmpty")}
              </p>
            ) : (
              notes.map((n) =>
                editingNoteId === n.id ? (
                  <div key={n.id} className="rounded-md border border-border p-4">
                    <Textarea
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      rows={4}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={cancelEditingNote}
                        className="h-9 px-3 rounded-md border border-input bg-card text-sm font-medium hover:bg-muted"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={submitNoteEdit}
                        disabled={!editingNoteText.trim() || savingNoteEdit}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {savingNoteEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {t("contactDetail.saveNote")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={n.id} className="group rounded-md border border-border p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString(i18nInst.language)}
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
        </div>
      </div>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("contactDetail.archiveTitle", { name: contact.contact_name })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("contactDetail.archiveBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await archiveContact();
                nav({ to: "/contacts" });
              }}
            >
              {t("contactDetail.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("contactDetail.deleteTitle", { name: contact.contact_name })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("contactDetail.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={t("contactDetail.deleteConfirmPlaceholder")}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText.trim().toLowerCase() !== "delete"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none"
              onClick={async () => {
                await deleteContact();
                nav({ to: "/contacts" });
              }}
            >
              {t("contactDetail.deleteContact")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DraftFollowUpDialog open={draftOpen} onOpenChange={setDraftOpen} contactId={contact.id} />
    </AppShell>
  );
}

function ContactHealthCard({
  contactId,
  onDraftClick,
}: {
  contactId: string;
  onDraftClick: () => void;
}) {
  const { t, i18n: i18nInstance } = useTranslation();
  const analyze = useServerFn(analyzeContactHealth);
  const [status, setStatus] = useState<AiInsightStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("contactDetail.ai.errorGeneric");

  const run = async (force: boolean) => {
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({ data: { language: safeLang, contactId, force } });
      setMarkdown(result.markdown);
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) setErrorKey("contactDetail.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("contactDetail.ai.errorCredits");
      else setErrorKey("contactDetail.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  return (
    <div className="relative">
      <AiInsightCard
        title={t("contactDetail.ai.title")}
        disclaimer={t("contactDetail.ai.disclaimer")}
        status={status}
        markdown={markdown}
        errorMessage={t(errorKey)}
        loadingLabel={t("contactDetail.ai.loading")}
        regenerateLabel={t("contactDetail.ai.regenerate")}
        onRegenerate={() => run(true)}
        className="pb-14"
      />
      <button
        type="button"
        onClick={onDraftClick}
        className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
      >
        <PenLine className="h-3.5 w-3.5" />
        {t("contactDetail.ai.draftButton")}
      </button>
    </div>
  );
}

function DraftFollowUpDialog({
  open,
  onOpenChange,
  contactId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
}) {
  const { t, i18n: i18nInstance } = useTranslation();
  const draft = useServerFn(draftFollowUp);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setErrorKey(null);
    setCopied(false);
    const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
    const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
    draft({ data: { language: safeLang, contactId } })
      .then((result) => setMessage(result.message))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("RATE_LIMIT")) setErrorKey("contactDetail.ai.errorRate");
        else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("contactDetail.ai.errorCredits");
        else setErrorKey("contactDetail.ai.errorGeneric");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId]);

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contactDetail.ai.draftDialogTitle")}</DialogTitle>
          <DialogDescription>{t("contactDetail.ai.draftDialogDescription")}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-2 animate-pulse py-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        )}

        {!loading && errorKey && <p className="text-sm text-error">{t(errorKey)}</p>}

        {!loading && !errorKey && (
          <Textarea value={message} readOnly rows={8} className="text-sm" />
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={copy}
            disabled={loading || !!errorKey}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("contactDetail.ai.copied") : t("contactDetail.ai.copy")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({
  icon,
  label,
  value,
  editing,
  onChange,
  draftValue,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  draftValue: string;
  type?: "text" | "date";
}) {
  return (
    <div>
      <div className="k-label mb-2 flex items-center gap-2">
        {icon}
        {label}
      </div>
      {editing ? (
        <Input
          type={type}
          value={draftValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      ) : (
        <div className="font-medium text-sm">{value}</div>
      )}
    </div>
  );
}

function StageBadge({ stage }: { stage: ContactStage }) {
  const { t } = useTranslation();
  const styles: Record<ContactStage, string> = {
    active: "bg-success-soft text-success",
    at_risk: "bg-warning-soft text-warning-foreground",
    new_lead: "bg-muted text-muted-foreground",
    contacted: "bg-muted text-muted-foreground",
    proposal: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${styles[stage]}`}
    >
      {t(`contacts.stages.${stage}`)}
    </span>
  );
}

type ProfileSaveStatus = "idle" | "saving" | "saved";

function ProfileSaveIndicator({
  status,
  savedAt,
}: {
  status: ProfileSaveStatus;
  savedAt: Date | null;
}) {
  const { t, i18n: i18nInst } = useTranslation();
  if (status !== "saved" || !savedAt) return null;
  const time = savedAt.toLocaleTimeString(i18nInst.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-success">
      <Check className="h-3.5 w-3.5" />
      {t("contactDetail.autosave.savedAt", { time })}
    </span>
  );
}
