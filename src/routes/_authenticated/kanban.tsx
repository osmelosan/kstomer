import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import {
  MoreHorizontal,
  Mail,
  Plus,
  Trash2,
  Download,
  GripVertical,
  Check,
  X,
} from "lucide-react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

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


// ---------- Types ----------
type Tone = "success" | "warning" | "destructive";
type Card = {
  id: string;
  name: string;
  amount: number;
  tag: { label: string; tone: Tone };
  confidence: number;
  meta?: string;
  createdAt: string;
};
type Column = {
  id: string;
  title: string;
  cardIds: string[];
  accent: string;
  wipLimit?: number;
};
type Board = { columns: Column[]; cards: Record<string, Card> };

type SortMode = "manual" | "name-asc" | "date-desc" | "date-asc";

const ACCENTS = [
  "#316bf3",
  "#22C55E",
  "#FBBF24",
  "#a855f7",
  "#ef4444",
  "#0ea5e9",
  "#64748b",
];

const STORAGE_KEY = "kstomer.kanban.v1";

// ---------- Initial data ----------
function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2)}`);
}

function initialBoard(): Board {
  const mk = (
    name: string,
    amount: number,
    tone: Tone,
    label: string,
    confidence: number,
    meta?: string,
    daysAgo = 0,
  ): Card => ({
    id: uid(),
    name,
    amount,
    tag: { label, tone },
    confidence,
    meta,
    createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  });

  const c1 = mk("Alice Lefebvre", 4500, "success", "NORMAL", 3, "Modifié il y a 2j", 2);
  const c2 = mk("TechFlow Solutions", 12000, "warning", "URGENT", 4, "Aujourd'hui", 0);
  const c3 = mk("Marc Antoine", 2300, "success", "SUIVI", 2, "Email envoyé hier", 1);
  const c4 = mk("Cabinet Legrand", 8900, "warning", "ATTENTE", 5, "Version 2 de la proposition…", 4);

  const cards: Record<string, Card> = { [c1.id]: c1, [c2.id]: c2, [c3.id]: c3, [c4.id]: c4 };

  const columns: Column[] = [
    { id: uid(), title: "Nouveau Lead", cardIds: [c1.id, c2.id], accent: ACCENTS[0] },
    { id: uid(), title: "Contacté", cardIds: [c3.id], accent: ACCENTS[5] },
    { id: uid(), title: "Proposition", cardIds: [c4.id], accent: ACCENTS[2] },
    { id: uid(), title: "Gagné", cardIds: [], accent: ACCENTS[1] },
  ];
  return { cards, columns };
}

function loadBoard(): Board {
  if (typeof window === "undefined") return initialBoard();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialBoard();
    const parsed = JSON.parse(raw) as Board;
    if (!parsed?.columns || !parsed?.cards) return initialBoard();
    return parsed;
  } catch {
    return initialBoard();
  }
}

// ---------- Helpers ----------
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

function tagCls(t: Tone) {
  switch (t) {
    case "success":
      return "bg-success-soft text-success";
    case "warning":
      return "bg-warning-soft text-warning-foreground";
    case "destructive":
      return "bg-destructive text-destructive-foreground";
  }
}

function findColumnIdByCard(board: Board, cardId: string): string | undefined {
  return board.columns.find((c) => c.cardIds.includes(cardId))?.id;
}

// ---------- Page ----------
function KanbanPage() {
  const { t } = useTranslation();
  const [board, setBoard] = useState<Board>(() => (typeof window !== "undefined" ? loadBoard() : initialBoard()));
  const [sortMode, setSortMode] = useState<SortMode>("manual");

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");
  const [minConfidence, setMinConfidence] = useState(1);
  const [compact, setCompact] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deleteColumn, setDeleteColumn] = useState<Column | null>(null);

  // Persistence
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
      /* noop */
    }
  }, [board]);

  // Derived
  const allTags = useMemo(() => {
    const s = new Set<string>();
    Object.values(board.cards).forEach((c) => s.add(c.tag.label));
    return Array.from(s);
  }, [board.cards]);

  const matchesFilter = (c: Card) => {
    if (c.confidence < minConfidence) return false;
    if (tagFilter !== "all" && c.tag.label !== tagFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !(c.meta?.toLowerCase().includes(q)) &&
        !String(c.amount).includes(q)
      )
        return false;
    }
    return true;
  };

  const displayedCardsByCol = useMemo(() => {
    const out: Record<string, string[]> = {};
    board.columns.forEach((col) => {
      let ids = col.cardIds.filter((id) => board.cards[id] && matchesFilter(board.cards[id]));
      if (sortMode !== "manual") {
        const sorted = [...ids].sort((a, b) => {
          const ca = board.cards[a];
          const cb = board.cards[b];
          if (sortMode === "name-asc") return ca.name.localeCompare(cb.name);
          if (sortMode === "date-desc") return cb.createdAt.localeCompare(ca.createdAt);
          return ca.createdAt.localeCompare(cb.createdAt);
        });
        ids = sorted;
      }
      out[col.id] = ids;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, sortMode, search, tagFilter, minConfidence]);

  // ---------- DnD ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "card";
    if (!isActiveCard) return;

    setBoard((prev) => {
      const fromCol = prev.columns.find((c) => c.cardIds.includes(activeId));
      if (!fromCol) return prev;

      // over a column?
      const overIsColumn = over.data.current?.type === "column";
      const toCol = overIsColumn
        ? prev.columns.find((c) => c.id === overId)!
        : prev.columns.find((c) => c.cardIds.includes(overId));
      if (!toCol || toCol.id === fromCol.id) return prev;

      const newCols = prev.columns.map((c) => {
        if (c.id === fromCol.id) {
          return { ...c, cardIds: c.cardIds.filter((id) => id !== activeId) };
        }
        if (c.id === toCol.id) {
          const overIndex = overIsColumn ? c.cardIds.length : c.cardIds.indexOf(overId);
          const next = [...c.cardIds];
          next.splice(overIndex < 0 ? next.length : overIndex, 0, activeId);
          return { ...c, cardIds: next };
        }
        return c;
      });
      return { ...prev, columns: newCols };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    // Column reorder
    if (active.data.current?.type === "column" && over.data.current?.type === "column") {
      setBoard((prev) => {
        const oldIdx = prev.columns.findIndex((c) => c.id === activeId);
        const newIdx = prev.columns.findIndex((c) => c.id === overId);
        if (oldIdx < 0 || newIdx < 0) return prev;
        return { ...prev, columns: arrayMove(prev.columns, oldIdx, newIdx) };
      });
      return;
    }

    // Reorder within column
    if (active.data.current?.type === "card") {
      setBoard((prev) => {
        const col = prev.columns.find((c) => c.cardIds.includes(activeId));
        if (!col) return prev;
        const overIndex = col.cardIds.indexOf(overId);
        const activeIndex = col.cardIds.indexOf(activeId);
        if (overIndex < 0 || activeIndex < 0 || overIndex === activeIndex) return prev;
        const newCols = prev.columns.map((c) =>
          c.id === col.id ? { ...c, cardIds: arrayMove(c.cardIds, activeIndex, overIndex) } : c,
        );
        return { ...prev, columns: newCols };
      });
    }
  }

  // ---------- Mutations ----------
  function addColumn() {
    setBoard((p) => ({
      ...p,
      columns: [
        ...p.columns,
        { id: uid(), title: i18n.t("kanban.newColumn"), cardIds: [], accent: ACCENTS[p.columns.length % ACCENTS.length] },
      ],
    }));
  }


  function renameColumn(id: string, title: string) {
    setBoard((p) => ({ ...p, columns: p.columns.map((c) => (c.id === id ? { ...c, title } : c)) }));
  }

  function setColumnAccent(id: string, accent: string) {
    setBoard((p) => ({ ...p, columns: p.columns.map((c) => (c.id === id ? { ...c, accent } : c)) }));
  }

  function setColumnWip(id: string, wipLimit?: number) {
    setBoard((p) => ({ ...p, columns: p.columns.map((c) => (c.id === id ? { ...c, wipLimit } : c)) }));
  }

  function deleteColumnConfirmed(col: Column, moveToId?: string) {
    setBoard((p) => {
      const remaining = p.columns.filter((c) => c.id !== col.id);
      let cards = p.cards;
      let cols = remaining;
      if (moveToId) {
        cols = remaining.map((c) =>
          c.id === moveToId ? { ...c, cardIds: [...c.cardIds, ...col.cardIds] } : c,
        );
      } else {
        cards = { ...cards };
        col.cardIds.forEach((id) => delete cards[id]);
      }
      return { columns: cols, cards };
    });
    setDeleteColumn(null);
  }

  function addCard(columnId: string) {
    const c: Card = {
      id: uid(),
      name: i18n.t("kanban.newOpportunity"),
      amount: 0,
      tag: { label: i18n.t("kanban.tags.normal"), tone: "success" },
      confidence: 3,
      createdAt: new Date().toISOString(),
    };
    setBoard((p) => ({
      cards: { ...p.cards, [c.id]: c },
      columns: p.columns.map((col) => (col.id === columnId ? { ...col, cardIds: [c.id, ...col.cardIds] } : col)),
    }));
    setEditingCardId(c.id);
  }


  function updateCard(card: Card) {
    setBoard((p) => ({ ...p, cards: { ...p.cards, [card.id]: card } }));
  }

  function deleteCard(id: string) {
    setBoard((p) => {
      const cards = { ...p.cards };
      delete cards[id];
      return {
        cards,
        columns: p.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((x) => x !== id) })),
      };
    });
    setEditingCardId(null);
  }

  function exportCSV() {
    const rows = [[t("kanban.csv.column"), t("kanban.csv.name"), t("kanban.csv.amount"), t("kanban.csv.tag"), t("kanban.csv.confidence"), t("kanban.csv.createdAt"), t("kanban.csv.notes")]];

    board.columns.forEach((col) => {
      col.cardIds.forEach((id) => {
        const c = board.cards[id];
        if (!c) return;
        rows.push([
          col.title,
          c.name,
          String(c.amount),
          c.tag.label,
          String(c.confidence),
          c.createdAt,
          c.meta ?? "",
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

  const activeCard = activeId ? board.cards[activeId] : null;
  const editingCard = editingCardId ? board.cards[editingCardId] : null;

  return (
    <AppShell
      title={t("kanban.title")}
      subtitle={t("kanban.subtitle")}
      search={{
        placeholder: t("kanban.searchPlaceholder"),
        value: search,
        onChange: setSearch,
      }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder={t("kanban.sort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">{t("kanban.sortManual")}</SelectItem>
            <SelectItem value="name-asc">{t("kanban.sortNameAsc")}</SelectItem>
            <SelectItem value="date-desc">{t("kanban.sortDateDesc")}</SelectItem>
            <SelectItem value="date-asc">{t("kanban.sortDateAsc")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={(v) => setTagFilter(v)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder={t("kanban.tag")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("kanban.allTags")}</SelectItem>
            {allTags.map((tg) => (
              <SelectItem key={tg} value={tg}>{tg}</SelectItem>
            ))}
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
          <label htmlFor="compact" className="text-muted-foreground cursor-pointer">{t("kanban.compactView")}</label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" /> {t("kanban.export")}
          </Button>
          <Button size="sm" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-1.5" /> {t("kanban.addColumn")}
          </Button>
        </div>
      </div>


      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4">
          <SortableContext items={board.columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            {board.columns.map((col) => (
              <ColumnView
                key={col.id}
                column={col}
                cardIds={displayedCardsByCol[col.id] ?? []}
                cards={board.cards}
                compact={compact}
                onRename={(t) => renameColumn(col.id, t)}
                onDelete={() => setDeleteColumn(col)}
                onAddCard={() => addCard(col.id)}
                onSetAccent={(a) => setColumnAccent(col.id, a)}
                onSetWip={(n) => setColumnWip(col.id, n)}
                onCardClick={(id) => setEditingCardId(id)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeCard ? (
            <CardView card={activeCard} accent="#316bf3" compact={compact} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card editor */}
      <Sheet open={!!editingCard} onOpenChange={(o) => !o && setEditingCardId(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {editingCard && (
            <CardEditor
              key={editingCard.id}
              card={editingCard}
              onSave={updateCard}
              onDelete={() => deleteCard(editingCard.id)}
              onClose={() => setEditingCardId(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete column dialog */}
      <AlertDialog open={!!deleteColumn} onOpenChange={(o) => !o && setDeleteColumn(null)}>
        <AlertDialogContent>
          {deleteColumn && (
            <DeleteColumnDialog
              column={deleteColumn}
              otherColumns={board.columns.filter((c) => c.id !== deleteColumn.id)}
              onConfirm={(moveTo) => deleteColumnConfirmed(deleteColumn, moveTo)}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// ---------- Column ----------
function ColumnView({
  column,
  cardIds,
  cards,
  compact,
  onRename,
  onDelete,
  onAddCard,
  onSetAccent,
  onSetWip,
  onCardClick,
}: {
  column: Column;
  cardIds: string[];
  cards: Record<string, Card>;
  compact: boolean;
  onRename: (t: string) => void;
  onDelete: () => void;
  onAddCard: () => void;
  onSetAccent: (a: string) => void;
  onSetWip: (n?: number) => void;
  onCardClick: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const total = cardIds.reduce((s, id) => s + (cards[id]?.amount ?? 0), 0);
  const wipOver = column.wipLimit !== undefined && cardIds.length > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-column-id={column.id}
      className="rounded-xl bg-muted/60 border border-border p-4 w-[300px] shrink-0 min-h-[460px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3 gap-1">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          aria-label={t("kanban.moveColumn")}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: column.accent }} />
        <EditableTitle value={column.title} onChange={onRename} />
        <span className={`text-xs font-semibold rounded-full border px-2 py-0.5 ${wipOver ? "bg-destructive text-destructive-foreground border-destructive" : "bg-card border-border"}`}>
          {cardIds.length}{column.wipLimit !== undefined ? `/${column.wipLimit}` : ""}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Column actions"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("kanban.accentColor")}</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-2 py-1">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  onClick={() => onSetAccent(a)}
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ background: a }}
                  aria-label={a}
                />
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs">
              <label className="block text-muted-foreground mb-1">{t("kanban.wipLimit")}</label>
              <Input
                type="number"
                min={0}
                value={column.wipLimit ?? ""}
                placeholder={t("kanban.wipNone")}
                className="h-8"
                onChange={(e) => {
                  const v = e.target.value;
                  onSetWip(v === "" ? undefined : Math.max(0, Number(v)));
                }}
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onAddCard}>
              <Plus className="h-4 w-4 mr-2" /> {t("kanban.addCard")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> {t("kanban.deleteColumn")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 ml-1">
        {t("kanban.columnTotal")} · {fmtMoneyShort(total)}
      </div>


      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {cardIds.length === 0 ? (
            <DroppableEmpty columnId={column.id} />
          ) : (
            cardIds.map((id) => {
              const card = cards[id];
              if (!card) return null;
              return (
                <SortableCard
                  key={id}
                  card={card}
                  accent={column.accent}
                  compact={compact}
                  onClick={() => onCardClick(id)}
                />
              );
            })
          )}
        </div>
      </SortableContext>

      <button
        onClick={onAddCard}
        className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground rounded-md border border-dashed border-border py-2 hover:bg-card/60 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" /> {t("kanban.addCard")}
      </button>
    </div>
  );
}


function DroppableEmpty({ columnId }: { columnId: string }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useSortable({ id: `empty-${columnId}`, data: { type: "column", columnId } });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-dashed text-muted-foreground text-sm py-10 text-center ${isOver ? "border-secondary bg-secondary/5" : "border-border bg-card/50"}`}
    >
      {t("kanban.dropHere")}
    </div>
  );
}


// ---------- Editable title ----------
function EditableTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onChange(draft.trim() || value);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(draft.trim() || value);
            setEditing(false);
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="flex-1 min-w-0 bg-card border border-input rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      className="flex-1 min-w-0 text-left text-[11px] font-bold tracking-wider uppercase text-foreground truncate hover:text-secondary"
      title={t("kanban.clickToRename")}
    >
      {value}
    </button>
  );
}


// ---------- Card ----------
function SortableCard({
  card,
  accent,
  compact,
  onClick,
}: {
  card: Card;
  accent: string;
  compact: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card" },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
      <CardView card={card} accent={accent} compact={compact} />
    </div>
  );
}

function CardView({
  card,
  accent,
  compact,
  dragging,
}: {
  card: Card;
  accent: string;
  compact: boolean;
  dragging?: boolean;
}) {
  return (
    <div
      className={`k-card cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow border-l-2 ${compact ? "p-2.5" : "p-4"} ${dragging ? "shadow-lg ring-2 ring-secondary/40" : ""}`}
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2 py-1 rounded-md ${tagCls(card.tag.tone)}`}>
          {card.tag.label}
        </span>
        <span className="text-sm font-bold">{fmtMoney(card.amount)}</span>
      </div>
      <h3 className={`${compact ? "mt-1 text-sm" : "mt-2"} font-semibold truncate`}>{card.name}</h3>
      {!compact && (
        <>
          <div className="mt-2 flex items-center gap-2">
            <Confidence value={card.confidence} />
            <span className="text-xs text-muted-foreground">{card.confidence}/5</span>
          </div>
          {card.meta && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {card.meta}
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
function CardEditor({
  card,
  onSave,
  onDelete,
  onClose,
}: {
  card: Card;
  onSave: (c: Card) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t, i18n: i18nInst } = useTranslation();
  const [draft, setDraft] = useState<Card>(card);

  function save() {
    onSave(draft);
    onClose();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{t("kanban.editCard")}</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.cardName")}</label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.amount")}</label>
          <Input
            type="number"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("kanban.tag")}</label>
            <Input
              value={draft.tag.label}
              onChange={(e) => setDraft({ ...draft, tag: { ...draft.tag, label: e.target.value.toUpperCase() } })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("kanban.tone")}</label>
            <Select
              value={draft.tag.tone}
              onValueChange={(v) => setDraft({ ...draft, tag: { ...draft.tag, tone: v as Tone } })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="success">{t("kanban.toneSuccess")}</SelectItem>
                <SelectItem value="warning">{t("kanban.toneWarning")}</SelectItem>
                <SelectItem value="destructive">{t("kanban.toneDestructive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.confidence")} : {draft.confidence}/5</label>
          <Slider
            value={[draft.confidence]}
            min={1}
            max={5}
            step={1}
            onValueChange={(v) => setDraft({ ...draft, confidence: v[0] })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("kanban.notes")}</label>
          <Textarea
            rows={4}
            value={draft.meta ?? ""}
            onChange={(e) => setDraft({ ...draft, meta: e.target.value })}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {t("kanban.createdOn", { date: new Date(card.createdAt).toLocaleDateString(i18nInst.language) })}
        </div>
      </div>
      <SheetFooter className="flex flex-row justify-between gap-2 sm:justify-between">
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1.5" /> {t("kanban.delete")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1.5" /> {t("kanban.cancel")}
          </Button>
          <Button onClick={save}>
            <Check className="h-4 w-4 mr-1.5" /> {t("kanban.save")}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}


// ---------- Delete column dialog ----------
function DeleteColumnDialog({
  column,
  otherColumns,
  onConfirm,
}: {
  column: Column;
  otherColumns: Column[];
  onConfirm: (moveTo?: string) => void;
}) {
  const { t } = useTranslation();
  const hasCards = column.cardIds.length > 0;
  const [moveTo, setMoveTo] = useState<string>(otherColumns[0]?.id ?? "");
  const [mode, setMode] = useState<"move" | "delete">(otherColumns.length > 0 ? "move" : "delete");

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{t("kanban.deleteTitle", { title: column.title })}</AlertDialogTitle>
        <AlertDialogDescription>
          {hasCards
            ? t("kanban.deleteWithCards", { count: column.cardIds.length })
            : t("kanban.deleteEmpty")}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {hasCards && otherColumns.length > 0 && (
        <div className="space-y-3 py-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" checked={mode === "move"} onChange={() => setMode("move")} />
            {t("kanban.moveCardsTo")}
            <Select value={moveTo} onValueChange={setMoveTo}>
              <SelectTrigger className="h-8 w-[160px] ml-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {otherColumns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" checked={mode === "delete"} onChange={() => setMode("delete")} />
            <Badge variant="destructive">{t("kanban.deleteAll")}</Badge>
          </label>
        </div>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel>{t("kanban.cancel")}</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={() => onConfirm(hasCards && mode === "move" ? moveTo : undefined)}
        >
          {t("kanban.delete")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

