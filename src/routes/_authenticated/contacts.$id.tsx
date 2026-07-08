import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  BadgeCheck,
  FileText,
  History,
  Mail,
  Phone,
  Calendar,
  TagIcon,
  Briefcase,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Check,
  Loader2,
  CloudUpload,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
import { useAutosave, type AutosaveStatus } from "@/hooks/use-autosave";
import { useContact } from "@/hooks/use-contact";
import type { Contact, ContactStage } from "@/hooks/use-contacts";
import { cn } from "@/lib/utils";

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
    note,
    noteHistory,
    loading,
    updateContact,
    saveNote,
    restoreVersion,
    archiveContact,
    deleteContact,
  } = useContact(id);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTouched, setNoteTouched] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const profileAutosave = useAutosave(draft, async (value) => {
    if (!value) return;
    await updateContact({
      contact_name: value.contact_name,
      company_name: value.company_name,
      email: value.email,
      phone: value.phone,
      stage: value.stage,
      confidence_level: value.confidence_level,
      renewal_date: value.renewal_date,
    });
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
    setEditing(true);
  }

  function stopEditing() {
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
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-2xl font-bold text-muted-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <Input
                  value={view.contact_name}
                  onChange={(e) => setDraft({ ...view, contact_name: e.target.value })}
                  className="text-xl font-bold h-10"
                />
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[24px] font-bold tracking-tight">{view.contact_name}</h2>
                  <StageBadge stage={view.stage} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AutosaveIndicator
                status={profileAutosave.status}
                savedAt={profileAutosave.savedAt}
              />
              <button
                onClick={editing ? stopEditing : startEditing}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold ${
                  editing
                    ? "border border-input bg-card hover:bg-muted"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
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
            <InfoField
              icon={<Phone className="h-4 w-4" />}
              label={t("contactDetail.phone")}
              value={view.phone ?? "—"}
              editing={editing}
              onChange={(v) => setDraft({ ...view, phone: v || null })}
              draftValue={view.phone ?? ""}
            />
            <InfoField
              icon={<Briefcase className="h-4 w-4" />}
              label={t("contactDetail.company")}
              value={view.company_name ?? "—"}
              editing={editing}
              onChange={(v) => setDraft({ ...view, company_name: v || null })}
              draftValue={view.company_name ?? ""}
            />
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

        {/* Notes */}
        <div className="k-card p-8">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="flex items-center gap-2 text-[20px] font-semibold">
              <FileText className="h-5 w-5 text-secondary" />
              {t("contactDetail.projectNotes")}
            </h3>
            <div className="flex items-center gap-2">
              <AutosaveIndicator status={noteAutosave.status} savedAt={noteAutosave.savedAt} />
              <button
                onClick={() => setVersionsOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm hover:bg-muted"
              >
                <History className="h-4 w-4" /> {t("contactDetail.versionHistory")}
                {noteHistory.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">({noteHistory.length})</span>
                )}
              </button>
            </div>
          </div>
          <Textarea
            value={noteTouched ? noteDraft : (note?.note_text ?? "")}
            onChange={(e) => {
              setNoteTouched(true);
              setNoteDraft(e.target.value);
            }}
            rows={7}
            className="text-sm"
          />
        </div>
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
                      {new Date(v.edited_at).toLocaleString(i18nInst.language)}
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
    </AppShell>
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
