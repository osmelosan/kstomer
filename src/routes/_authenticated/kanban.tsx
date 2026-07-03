import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Mail, Plus, Trash2, Download, Check, X, ArrowUpRight } from "lucide-react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useContacts, type Contact, type ContactStage } from "@/hooks/use-contacts";
import { useCompany } from "@/lib/company-context";

export const Route = createFileRoute("/_authenticated/kanban")({
  head: () =>
    pageHead({
      routeKey: "kanban",
      title: i18n.t("kanban.metaTitle"),
      path: "/kanban",
      noindex: true,
    }),
  component: KanbanPage,
});

const STAGES: ContactStage[] = ["new_lead", "contacted", "proposal", "active", "at_risk"];
const STAGE_ACCENT: Record<ContactStage, string> = {
  new_lead: "#316bf3",
  contacted: "#0ea5e9",
  proposal: "#FBBF24",
  active: "#22C55E",
  at_risk: "#ef4444",
};

type SortMode = "date-desc" | "date-asc" | "name-asc";

// A contact not yet persisted — only exists locally until the editor Save
// button is clicked, so cancelling never creates a stray record.
type DraftCard = { stage: ContactStage };

function fmtMoney(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtMoneyShort(n: number) {
  if (n >= 1000) return `€${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return fmtMoney(n);
}

// ---------- Page ----------
function KanbanPage() {
  const { t } = useTranslation();
  const { current } = useCompany();
  const {
    contacts,
    loading,
    createContact,
    updateContact,
    changeStage,
    upsertDealValue,
    archiveContact,
  } = useContacts();

  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [search, setSearch] = useState("");
  const [minConfidence, setMinConfidence] = useState(1);
  const [compact, setCompact] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftCard | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Contact | null>(null);

  const matchesFilter = (c: Contact) => {
    if ((c.confidence_level ?? 0) < minConfidence) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !c.contact_name.toLowerCase().includes(q) &&
        !c.company_name?.toLowerCase().includes(q) &&
        !c.email?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  };

  const byStage = useMemo(() => {
    const out: Record<ContactStage, Contact[]> = {
      new_lead: [],
      contacted: [],
      proposal: [],
      active: [],
      at_risk: [],
    };
    contacts.filter(matchesFilter).forEach((c) => out[c.stage]?.push(c));
    for (const stage of STAGES) {
      out[stage].sort((a, b) => {
        if (sortMode === "name-asc") return a.contact_name.localeCompare(b.contact_name);
        if (sortMode === "date-asc") return a.created_at.localeCompare(b.created_at);
        return b.created_at.localeCompare(a.created_at);
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, sortMode, search, minConfidence]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const contactId = String(active.id);
    const toStage = String(over.id) as ContactStage;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || contact.stage === toStage) return;
    void changeStage(contactId, toStage);
  }

  function addCard(stage: ContactStage) {
    setDraft({ stage });
    setEditingId(null);
  }

  function exportCSV() {
    const rows = [
      [
        t("kanban.csv.column"),
        t("kanban.csv.name"),
        t("kanban.csv.amount"),
        t("kanban.csv.confidence"),
        t("kanban.csv.createdAt"),
      ],
    ];
    STAGES.forEach((stage) => {
      byStage[stage].forEach((c) => {
        rows.push([
          t(`contacts.stages.${stage}`),
          c.contact_name,
          String(c.subscription_details?.deal_value ?? 0),
          String(c.confidence_level ?? ""),
          c.created_at,
        ]);
      });
    });
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeContact = activeId ? contacts.find((c) => c.id === activeId) : null;
  const editingContact = editingId ? contacts.find((c) => c.id === editingId) : null;
  const sheetOpen = !!editingContact || !!draft;

  return (
    <AppShell
      title={t("kanban.title")}
      subtitle={t("kanban.subtitle")}
      search={{ placeholder: t("kanban.searchPlaceholder"), value: search, onChange: setSearch }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder={t("kanban.sort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">{t("kanban.sortDateDesc")}</SelectItem>
            <SelectItem value="date-asc">{t("kanban.sortDateAsc")}</SelectItem>
            <SelectItem value="name-asc">{t("kanban.sortNameAsc")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("kanban.confidenceMin")}</span>
          <div className="w-28">
            <Slider
              value={[minConfidence]}
              min={1}
              max={5}
              step={1}
              onValueChange={(v) => setMinConfidence(v[0])}
            />
          </div>
          <span className="font-semibold w-4">{minConfidence}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Switch checked={compact} onCheckedChange={setCompact} id="compact" />
          <label htmlFor="compact" className="text-muted-foreground cursor-pointer">
            {t("kanban.compactView")}
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" /> {t("kanban.export")}
          </Button>
        </div>
      </div>

      {current.id === "all" ? (
        <div className="k-card p-6 text-sm text-muted-foreground">{t("kanban.noCompany")}</div>
      ) : loading ? (
        <div className="k-card p-6 text-sm text-muted-foreground">{t("common.loading")}</div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <ColumnView
                key={stage}
                stage={stage}
                contacts={byStage[stage]}
                compact={compact}
                onAddCard={() => addCard(stage)}
                onCardClick={(id) => setEditingId(id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeContact ? (
              <CardView
                contact={activeContact}
                accent={STAGE_ACCENT[activeContact.stage]}
                compact={compact}
                dragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Card editor */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditingId(null);
            setDraft(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {editingContact && (
            <CardEditor
              key={editingContact.id}
              contact={editingContact}
              onSave={async (patch) => {
                await updateContact(editingContact.id, {
                  contact_name: patch.contact_name,
                  confidence_level: patch.confidence_level,
                });
                if (patch.stage !== editingContact.stage) {
                  await changeStage(editingContact.id, patch.stage);
                }
                await upsertDealValue(
                  editingContact.id,
                  editingContact.organization_id,
                  patch.amount,
                );
                setEditingId(null);
              }}
              onArchive={() => {
                setArchiveTarget(editingContact);
                setEditingId(null);
              }}
              onClose={() => setEditingId(null)}
            />
          )}
          {draft && (
            <CardEditor
              key={`draft-${draft.stage}`}
              stage={draft.stage}
              onSave={async (patch) => {
                const created = await createContact({
                  contact_name: patch.contact_name,
                  stage: patch.stage,
                  confidence_level: patch.confidence_level,
                });
                if (created && patch.amount) {
                  await upsertDealValue(created.id, created.organization_id, patch.amount);
                }
                setDraft(null);
              }}
              onClose={() => setDraft(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Archive confirmation */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("kanban.archiveTitle", { name: archiveTarget?.contact_name ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("kanban.archiveBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("kanban.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (archiveTarget) void archiveContact(archiveTarget.id);
                setArchiveTarget(null);
              }}
            >
              {t("kanban.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// ---------- Column ----------
function ColumnView({
  stage,
  contacts,
  compact,
  onAddCard,
  onCardClick,
}: {
  stage: ContactStage;
  contacts: Contact[];
  compact: boolean;
  onAddCard: () => void;
  onCardClick: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = contacts.reduce((s, c) => s + (c.subscription_details?.deal_value ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-4 w-[300px] shrink-0 min-h-[460px] flex flex-col transition-colors ${
        isOver ? "border-secondary bg-secondary/5" : "border-border bg-muted/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3 gap-1">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: STAGE_ACCENT[stage] }}
        />
        <span className="flex-1 min-w-0 text-left text-[11px] font-bold tracking-wider uppercase text-foreground truncate">
          {t(`contacts.stages.${stage}`)}
        </span>
        <span className="text-xs font-semibold rounded-full border px-2 py-0.5 bg-card border-border">
          {contacts.length}
        </span>
      </div>

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 ml-1">
        {t("kanban.columnTotal")} · {fmtMoneyShort(total)}
      </div>

      <div className="space-y-3 flex-1">
        {contacts.length === 0 ? (
          <div
            className={`rounded-lg border border-dashed text-muted-foreground text-sm py-10 text-center ${isOver ? "border-secondary bg-secondary/5" : "border-border bg-card/50"}`}
          >
            {t("kanban.dropHere")}
          </div>
        ) : (
          contacts.map((c) => (
            <DraggableCard
              key={c.id}
              contact={c}
              accent={STAGE_ACCENT[stage]}
              compact={compact}
              onClick={() => onCardClick(c.id)}
            />
          ))
        )}
      </div>

      <button
        onClick={onAddCard}
        className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground rounded-md border border-dashed border-border py-2 hover:bg-card/60 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" /> {t("kanban.addCard")}
      </button>
    </div>
  );
}

// ---------- Card ----------
function DraggableCard({
  contact,
  accent,
  compact,
  onClick,
}: {
  contact: Contact;
  accent: string;
  compact: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: contact.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <CardView contact={contact} accent={accent} compact={compact} />
    </div>
  );
}

function CardView({
  contact,
  accent,
  compact,
  dragging,
}: {
  contact: Contact;
  accent: string;
  compact: boolean;
  dragging?: boolean;
}) {
  const amount = contact.subscription_details?.deal_value;
  return (
    <div
      className={`k-card cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow border-l-2 ${compact ? "p-2.5" : "p-4"} ${dragging ? "shadow-lg ring-2 ring-secondary/40" : ""}`}
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between">
        <h3 className={`${compact ? "text-sm" : ""} font-semibold truncate`}>
          {contact.contact_name}
        </h3>
        {amount ? (
          <span className="text-sm font-bold shrink-0 ml-2">{fmtMoney(amount)}</span>
        ) : null}
      </div>
      {!compact && (
        <>
          {contact.company_name && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {contact.company_name}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Confidence value={contact.confidence_level ?? 0} />
            <span className="text-xs text-muted-foreground">
              {contact.confidence_level ?? "—"}/5
            </span>
          </div>
          {contact.email && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {contact.email}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background:
              i <= value
                ? "var(--color-secondary)"
                : "color-mix(in oklab, var(--color-secondary) 18%, transparent)",
          }}
        />
      ))}
    </div>
  );
}

// ---------- Card editor ----------
type CardPatch = {
  contact_name: string;
  amount: number;
  confidence_level: number | null;
  stage: ContactStage;
};

function CardEditor({
  contact,
  stage,
  onSave,
  onArchive,
  onClose,
}: {
  contact?: Contact;
  stage?: ContactStage;
  onSave: (patch: CardPatch) => void | Promise<void>;
  onArchive?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(contact?.contact_name ?? "");
  const [amount, setAmount] = useState(contact?.subscription_details?.deal_value ?? 0);
  const [confidence, setConfidence] = useState(contact?.confidence_level ?? 3);
  const [cardStage, setCardStage] = useState<ContactStage>(contact?.stage ?? stage ?? "new_lead");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const nameError = touched && !name.trim() ? t("kanban.errors.nameRequired") : undefined;

  async function save() {
    if (!name.trim()) {
      setTouched(true);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        contact_name: name.trim(),
        amount: Math.max(0, amount),
        confidence_level: confidence,
        stage: cardStage,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{contact ? t("kanban.editCard") : t("kanban.newOpportunity")}</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("kanban.cardName")}
          </label>
          <Input
            value={name}
            aria-invalid={!!nameError}
            className={nameError ? "border-destructive" : undefined}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.amount")}</label>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.stage")}</label>
          <Select value={cardStage} onValueChange={(v) => setCardStage(v as ContactStage)}>
            <SelectTrigger>
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
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("kanban.confidence")} : {confidence}/5
          </label>
          <Slider
            value={[confidence]}
            min={1}
            max={5}
            step={1}
            onValueChange={(v) => setConfidence(v[0])}
          />
        </div>
        {contact && (
          <Link
            to="/contacts/$id"
            params={{ id: contact.id }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
          >
            {t("kanban.viewFullContact")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <SheetFooter className="flex flex-row justify-between gap-2 sm:justify-between">
        {onArchive ? (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onArchive}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> {t("kanban.archive")}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1.5" /> {t("kanban.cancel")}
          </Button>
          <Button onClick={save} disabled={!!nameError || saving}>
            <Check className="h-4 w-4 mr-1.5" /> {t("kanban.save")}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
