import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  BadgeCheck,
  FileText,
  History,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Tag as TagIcon,
  Upload,
  Download,
  Trash2,
  MoreHorizontal,
  Plus,
  Globe,
  Linkedin,
  MapPin,
  Briefcase,
  X,
  Pencil,
  Activity,
  Paperclip,
  TrendingUp,
  RotateCcw,
  Check,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAutosave, type AutosaveStatus } from "@/hooks/use-autosave";

export const Route = createFileRoute("/contacts/$id")({
  head: () => ({ meta: [{ title: i18n.t("contactDetail.metaTitle") }] }),
  component: ContactDetails,
});

type Status = "activeClient" | "hotProspect" | "inactive";

type ActivityItem = {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "status" | "document";
  title: string;
  subtitle?: string;
  date: string;
};

type DocItem = {
  id: string;
  name: string;
  size: string;
  date: string;
  ext: string;
};

type NoteVersion = {
  id: string;
  content: string;
  author: string;
  date: string;
};

type Opportunity = {
  id: string;
  title: string;
  stage: string;
  amount: string;
  confidence: number;
};

function ContactDetails() {
  const { id } = useParams({ from: "/contacts/$id" });
  const { t } = useTranslation();

  const display = id
    .split("-")
    .map((s: string) => (s[0]?.toUpperCase() ?? "") + s.slice(1))
    .join(" ");

  // ----- Profile state
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: display,
    role: t("contactDetail.role"),
    email: "julien.b@beaumont.digital",
    phone: "+33 6 12 34 56 78",
    company: "Beaumont Digital",
    position: "CEO",
    website: "beaumont.digital",
    linkedin: "in/julien-beaumont",
    address: "12 rue Lafayette, Paris",
    status: "hotProspect" as Status,
    source: "LinkedIn",
    confidence: 4,
  });
  const [draft, setDraft] = useState(profile);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }
  function saveEdit() {
    setProfile(draft);
    setEditing(false);
  }
  function cancelEdit() {
    setDraft(profile);
    setEditing(false);
  }

  // ----- Tags
  const [tags, setTags] = useState<string[]>(["VIP", "Premium", "Q4"]);
  const [newTag, setNewTag] = useState("");
  function addTag() {
    const v = newTag.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setNewTag("");
  }

  // ----- Notes & versions
  const [note, setNote] = useState(t("contactDetail.sampleNote"));
  const [draftNote, setDraftNote] = useState(note);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);

  function saveNote() {
    if (draftNote === note) return;
    setVersions((prev) => [
      {
        id: crypto.randomUUID(),
        content: note,
        author: "Thomas Melo",
        date: new Date().toLocaleString(i18n.language),
      },
      ...prev,
    ]);
    setNote(draftNote);
  }
  function restoreVersion(v: NoteVersion) {
    setVersions((prev) => [
      {
        id: crypto.randomUUID(),
        content: note,
        author: "Thomas Melo",
        date: new Date().toLocaleString(i18n.language),
      },
      ...prev.filter((x) => x.id !== v.id),
    ]);
    setNote(v.content);
    setDraftNote(v.content);
    setVersionsOpen(false);
  }

  // ----- Activity
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "a1",
      type: "email",
      title: t("contactDetail.activity.samples.emailSent"),
      subtitle: t("contactDetail.activity.samples.emailSentSub"),
      date: "2d",
    },
    {
      id: "a2",
      type: "call",
      title: t("contactDetail.activity.samples.callMade"),
      subtitle: t("contactDetail.activity.samples.callMadeSub"),
      date: "5d",
    },
    {
      id: "a3",
      type: "status",
      title: t("contactDetail.activity.samples.statusChanged"),
      subtitle: t("contactDetail.activity.samples.statusChangedSub"),
      date: "1w",
    },
    {
      id: "a4",
      type: "meeting",
      title: t("contactDetail.activity.samples.meetingHeld"),
      subtitle: t("contactDetail.activity.samples.meetingHeldSub"),
      date: "2w",
    },
  ]);
  const [addingActivity, setAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<{ type: ActivityItem["type"]; title: string }>({
    type: "note",
    title: "",
  });
  function saveActivity() {
    if (!newActivity.title.trim()) return;
    setActivities((prev) => [
      {
        id: crypto.randomUUID(),
        type: newActivity.type,
        title: newActivity.title.trim(),
        date: t("contactDetail.activity.samples.statusChangedSub").length ? "now" : "now",
      },
      ...prev,
    ]);
    setNewActivity({ type: "note", title: "" });
    setAddingActivity(false);
  }

  // ----- Documents
  const [docs, setDocs] = useState<DocItem[]>([
    { id: "d1", name: "devis-premium.pdf", size: "248 KB", date: "12/03/2024", ext: "pdf" },
    { id: "d2", name: "contrat-v2.docx", size: "82 KB", date: "08/03/2024", ext: "docx" },
    { id: "d3", name: "brief-projet.pdf", size: "1.2 MB", date: "01/03/2024", ext: "pdf" },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const added: DocItem[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      date: new Date().toLocaleDateString(i18n.language),
      ext: f.name.split(".").pop()?.toLowerCase() ?? "file",
    }));
    setDocs((prev) => [...added, ...prev]);
  }

  // ----- Opportunities (mock)
  const opportunities: Opportunity[] = [
    {
      id: "o1",
      title: t("contactDetail.opportunities.samples.premiumDeal"),
      stage: t("contactDetail.opportunities.samples.premiumStage"),
      amount: "4 200 €",
      confidence: 4,
    },
    {
      id: "o2",
      title: t("contactDetail.opportunities.samples.auditDeal"),
      stage: t("contactDetail.opportunities.samples.auditStage"),
      amount: "1 800 €",
      confidence: 3,
    },
  ];

  const initials = profile.name
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <AppShell title={t("contactDetail.title")}>
      <div className="mb-4">
        <Link to="/contacts" className="text-sm text-muted-foreground hover:text-foreground">
          {t("contactDetail.back")}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Header card */}
          <div className="k-card p-8">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-2xl font-bold text-muted-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-2">
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="text-xl font-bold h-10"
                    />
                    <Input
                      value={draft.role}
                      onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-[24px] font-bold tracking-tight">{profile.name}</h2>
                      <StatusBadge status={profile.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <BadgeCheck className="h-4 w-4 text-secondary" />
                      {profile.role}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="h-10 px-3 rounded-md border border-input bg-card text-sm font-medium hover:bg-muted"
                    >
                      {t("contactDetail.cancel")}
                    </button>
                    <button
                      onClick={saveEdit}
                      className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                    >
                      {t("contactDetail.save")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startEdit}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                    >
                      <Pencil className="h-4 w-4" />
                      {t("contactDetail.editProfile")}
                    </button>
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
                          <a href={`mailto:${profile.email}`}>
                            <Mail className="h-4 w-4" /> {t("contactDetail.sendEmail")}
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`tel:${profile.phone}`}>
                            <Phone className="h-4 w-4" /> {t("contactDetail.callPhone")}
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4" /> {t("contactDetail.scheduleFollowup")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4" /> {t("contactDetail.archive")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> {t("contactDetail.deleteContact")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full pl-2.5 pr-1.5 py-1 gap-1">
                  {tag}
                  <button
                    aria-label="remove"
                    onClick={() => setTags(tags.filter((x) => x !== tag))}
                    className="h-4 w-4 grid place-items-center rounded-full hover:bg-background/40"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder={t("contactDetail.addTag")}
                  className="h-7 w-36 text-xs"
                />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-border">
              <InfoField
                icon={<Mail className="h-4 w-4" />}
                label={t("contactDetail.workEmail")}
                value={profile.email}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, email: v })}
                draftValue={draft.email}
              />
              <InfoField
                icon={<Phone className="h-4 w-4" />}
                label={t("contactDetail.phone")}
                value={profile.phone}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, phone: v })}
                draftValue={draft.phone}
              />
              <InfoField
                icon={<Briefcase className="h-4 w-4" />}
                label={t("contactDetail.company")}
                value={profile.company}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, company: v })}
                draftValue={draft.company}
              />
              <InfoField
                icon={<BadgeCheck className="h-4 w-4" />}
                label={t("contactDetail.position")}
                value={profile.position}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, position: v })}
                draftValue={draft.position}
              />
              <InfoField
                icon={<Globe className="h-4 w-4" />}
                label={t("contactDetail.website")}
                value={profile.website}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, website: v })}
                draftValue={draft.website}
              />
              <InfoField
                icon={<Linkedin className="h-4 w-4" />}
                label={t("contactDetail.linkedin")}
                value={profile.linkedin}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, linkedin: v })}
                draftValue={draft.linkedin}
              />
              <InfoField
                icon={<MapPin className="h-4 w-4" />}
                label={t("contactDetail.address")}
                value={profile.address}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, address: v })}
                draftValue={draft.address}
              />
              <div>
                <div className="k-label mb-2 flex items-center gap-2">
                  <TagIcon className="h-3.5 w-3.5" /> {t("contactDetail.status")}
                </div>
                {editing ? (
                  <Select
                    value={draft.status}
                    onValueChange={(v) => setDraft({ ...draft, status: v as Status })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activeClient">
                        {t("contactDetail.statusOptions.activeClient")}
                      </SelectItem>
                      <SelectItem value="hotProspect">
                        {t("contactDetail.statusOptions.hotProspect")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("contactDetail.statusOptions.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={profile.status} />
                )}
              </div>

              {/* Confidence */}
              <div className="md:col-span-2">
                <div className="k-label mb-3">{t("contactDetail.confidenceLevel")}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const value = editing ? draft.confidence : profile.confidence;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!editing}
                        onClick={() => editing && setDraft({ ...draft, confidence: i })}
                        className="h-3 flex-1 rounded-full transition-colors"
                        style={{
                          background:
                            i <= value
                              ? "var(--color-secondary)"
                              : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                          cursor: editing ? "pointer" : "default",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 text-secondary font-semibold text-sm">
                  {(editing ? draft.confidence : profile.confidence)} / 5
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>{t("contactDetail.meta.created")}</span>
              <span>{t("contactDetail.meta.lastInteraction")}</span>
              <span>{t("contactDetail.meta.owner")}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="k-card p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-[20px] font-semibold">
                <FileText className="h-5 w-5 text-secondary" />
                {t("contactDetail.projectNotes")}
                {draftNote !== note && (
                  <span className="ml-2 inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5 bg-success-soft text-success">
                    {t("contactDetail.modified")}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setVersionsOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm hover:bg-muted"
              >
                <History className="h-4 w-4" /> {t("contactDetail.versionHistory")}
                {versions.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">({versions.length})</span>
                )}
              </button>
            </div>
            <Textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              rows={7}
              className="text-sm"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={saveNote}
                disabled={draftNote === note}
                className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("contactDetail.saveNote")}
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="k-card p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-[20px] font-semibold">
                <Activity className="h-5 w-5 text-secondary" />
                {t("contactDetail.activity.title")}
              </h3>
              {!addingActivity && (
                <button
                  onClick={() => setAddingActivity(true)}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-card text-sm hover:bg-muted"
                >
                  <Plus className="h-4 w-4" /> {t("contactDetail.activity.addActivity")}
                </button>
              )}
            </div>

            {addingActivity && (
              <div className="mb-5 p-4 rounded-md border border-border bg-muted/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3">
                  <Select
                    value={newActivity.type}
                    onValueChange={(v) =>
                      setNewActivity({ ...newActivity, type: v as ActivityItem["type"] })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["email", "call", "meeting", "note", "status", "document"] as const).map(
                        (k) => (
                          <SelectItem key={k} value={k}>
                            {t(`contactDetail.activity.types.${k}`)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder={t("contactDetail.activity.placeholder")}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setAddingActivity(false);
                      setNewActivity({ type: "note", title: "" });
                    }}
                    className="h-9 px-3 rounded-md border border-input bg-card text-sm"
                  >
                    {t("contactDetail.activity.cancel")}
                  </button>
                  <button
                    onClick={saveActivity}
                    className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    {t("contactDetail.activity.save")}
                  </button>
                </div>
              </div>
            )}

            <ol className="relative border-l border-border pl-6 space-y-5">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[31px] grid place-items-center h-7 w-7 rounded-full bg-secondary/10 text-secondary border border-background">
                    <ActivityIcon type={a.type} />
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{a.title}</div>
                      {a.subtitle && (
                        <div className="text-xs text-muted-foreground mt-0.5">{a.subtitle}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{a.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Documents */}
          <div className="k-card p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-[20px] font-semibold">
                <Paperclip className="h-5 w-5 text-secondary" />
                {t("contactDetail.documents.title")}
              </h3>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Upload className="h-4 w-4" /> {t("contactDetail.documents.upload")}
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {docs.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-md">
                {t("contactDetail.documents.empty")}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted grid place-items-center text-[10px] font-bold uppercase text-muted-foreground">
                      {d.ext}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.size} · {t("contactDetail.documents.addedOn", { date: d.date })}
                      </div>
                    </div>
                    <button
                      aria-label={t("contactDetail.documents.download")}
                      className="h-9 w-9 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={t("contactDetail.documents.delete")}
                      onClick={() => setDocs(docs.filter((x) => x.id !== d.id))}
                      className="h-9 w-9 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Opportunities */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("contactDetail.opportunities.title")}
            </h4>
            {opportunities.map((o) => (
              <div key={o.id} className="k-card p-4">
                <div className="text-sm font-semibold">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("contactDetail.opportunities.stage")} · {o.stage}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold">{o.amount}</span>
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-secondary/10 text-secondary">
                    {o.confidence} / 5
                  </span>
                </div>
              </div>
            ))}
            <Link
              to="/kanban"
              className="block text-xs font-semibold text-secondary hover:underline"
            >
              {t("contactDetail.opportunities.viewKanban")} →
            </Link>
          </section>

          {/* Related contacts */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("contactDetail.relatedContacts")}
            </h4>
            <div className="k-card p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 grid place-items-center text-secondary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">TechSolutions</div>
                <div className="text-xs text-muted-foreground">
                  {t("contactDetail.partnerTier")}
                </div>
              </div>
            </div>
            <div className="k-card p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">SM</div>
              <div>
                <div className="text-sm font-semibold">Sophie Martin</div>
                <div className="text-xs text-muted-foreground">{t("contactDetail.associate")}</div>
              </div>
            </div>
          </section>
        </aside>
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
              <p className="text-sm whitespace-pre-wrap">{note}</p>
            </div>
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("contactDetail.versions.empty")}
              </p>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">
                      {v.date} · {t("contactDetail.versions.by", { name: v.author })}
                    </div>
                    <button
                      onClick={() => restoreVersion(v)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("contactDetail.versions.restore")}
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{v.content}</p>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  draftValue: string;
}) {
  return (
    <div>
      <div className="k-label mb-2 flex items-center gap-2">
        {icon}
        {label}
      </div>
      {editing ? (
        <Input value={draftValue} onChange={(e) => onChange(e.target.value)} className="h-9" />
      ) : (
        <div className="font-medium text-sm">{value}</div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation();
  const styles: Record<Status, string> = {
    activeClient: "bg-success-soft text-success",
    hotProspect: "bg-warning-soft text-warning-foreground",
    inactive: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${styles[status]}`}
    >
      {t(`contactDetail.statusOptions.${status}`)}
    </span>
  );
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const cls = "h-3.5 w-3.5";
  switch (type) {
    case "email":
      return <Mail className={cls} />;
    case "call":
      return <Phone className={cls} />;
    case "meeting":
      return <Calendar className={cls} />;
    case "note":
      return <MessageSquare className={cls} />;
    case "status":
      return <BadgeCheck className={cls} />;
    case "document":
      return <Paperclip className={cls} />;
  }
}
