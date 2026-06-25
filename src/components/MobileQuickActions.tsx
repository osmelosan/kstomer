import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, KanbanSquare, MessageSquare, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addQuickNote } from "@/lib/quick-notes";

const KANBAN_STORAGE_KEY = "kstomer.kanban.v1";

// Keep this list in sync with src/routes/_authenticated/contacts.index.tsx
const CONTACT_OPTIONS = [
  { id: "jean-dupont", name: "Jean Dupont" },
  { id: "marie-lefebvre", name: "Marie Lefebvre" },
  { id: "pierre-durand", name: "Pierre Durand" },
];

type Mode = "menu" | "opportunity" | "note";

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function pushOpportunity(input: { name: string; amount: number; tag: string }) {
  try {
    const raw = window.localStorage.getItem(KANBAN_STORAGE_KEY);
    if (!raw) return false;
    const board = JSON.parse(raw) as {
      columns: { id: string; cardIds: string[] }[];
      cards: Record<string, unknown>;
    };
    if (!board?.columns?.length) return false;
    const card = {
      id: uid(),
      name: input.name,
      amount: input.amount,
      tag: { label: input.tag.toUpperCase(), tone: "success" },
      confidence: 3,
      createdAt: new Date().toISOString(),
    };
    board.cards[card.id] = card;
    board.columns[0].cardIds = [card.id, ...board.columns[0].cardIds];
    window.localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(board));
    return true;
  } catch {
    return false;
  }
}

export function MobileQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");

  // opportunity form
  const [oppName, setOppName] = useState("");
  const [oppAmount, setOppAmount] = useState("");
  const [oppTag, setOppTag] = useState("normal");

  // note form
  const [noteContact, setNoteContact] = useState<string>(CONTACT_OPTIONS[0].id);
  const [noteContent, setNoteContent] = useState("");

  function reset() {
    setMode("menu");
    setOppName("");
    setOppAmount("");
    setOppTag("normal");
    setNoteContent("");
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  function submitOpportunity() {
    if (!oppName.trim()) return;
    const amount = Number(oppAmount.replace(/[^0-9.]/g, "")) || 0;
    const ok = pushOpportunity({ name: oppName.trim(), amount, tag: oppTag });
    if (!ok) {
      // Fallback: send the user to the kanban to seed the board first
      toast.error(t("quickActions.kanbanInitNeeded"));
      navigate({ to: "/kanban" });
    } else {
      toast.success(t("quickActions.opportunityCreated"), {
        action: {
          label: t("quickActions.viewInPipeline"),
          onClick: () => navigate({ to: "/kanban" }),
        },
      });
    }
    close();
  }

  function submitNote() {
    if (!noteContent.trim()) return;
    addQuickNote(noteContact, noteContent.trim());
    const contact = CONTACT_OPTIONS.find((c) => c.id === noteContact);
    toast.success(t("quickActions.noteAdded", { name: contact?.name ?? "" }), {
      action: {
        label: t("quickActions.viewContact"),
        onClick: () => navigate({ to: "/contacts/$id", params: { id: noteContact } }),
      },
    });
    close();
  }

  return (
    <>
      <button
        type="button"
        aria-label={t("quickActions.open")}
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className={cn(
          "md:hidden fixed bottom-5 right-5 z-40",
          "h-14 w-14 rounded-full",
          "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30",
          "flex items-center justify-center",
          "hover:bg-secondary/90 active:scale-95 transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30",
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 max-h-[88vh] overflow-y-auto"
        >
          <SheetHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between gap-4 space-y-0">
            <SheetTitle className="text-base">
              {mode === "menu"
                ? t("quickActions.title")
                : mode === "opportunity"
                  ? t("quickActions.newOpportunity")
                  : t("quickActions.addNote")}
            </SheetTitle>
            {mode !== "menu" && (
              <button
                type="button"
                onClick={() => setMode("menu")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← {t("quickActions.back")}
              </button>
            )}
          </SheetHeader>

          <div className="px-5 pb-8">
            {mode === "menu" && (
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("opportunity")}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <KanbanSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("quickActions.newOpportunity")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("quickActions.newOpportunitySub")}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("note")}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("quickActions.addNote")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("quickActions.addNoteSub")}
                    </p>
                  </div>
                </button>

                <Link
                  to="/contacts/new"
                  onClick={close}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("quickActions.newContact")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("quickActions.newContactSub")}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {mode === "opportunity" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("quickActions.opportunityName")}
                  </span>
                  <Input
                    autoFocus
                    value={oppName}
                    onChange={(e) => setOppName(e.target.value)}
                    placeholder={t("quickActions.opportunityNamePh")}
                    className="mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("quickActions.opportunityAmount")}
                  </span>
                  <Input
                    inputMode="decimal"
                    value={oppAmount}
                    onChange={(e) => setOppAmount(e.target.value)}
                    placeholder="2500"
                    className="mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("quickActions.opportunityTag")}
                  </span>
                  <Select value={oppTag} onValueChange={setOppTag}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t("quickActions.tags.normal")}</SelectItem>
                      <SelectItem value="urgent">{t("quickActions.tags.urgent")}</SelectItem>
                      <SelectItem value="suivi">{t("quickActions.tags.followUp")}</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <button
                  type="button"
                  onClick={submitOpportunity}
                  disabled={!oppName.trim()}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {t("quickActions.create")}
                </button>
              </div>
            )}

            {mode === "note" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("quickActions.selectContact")}
                  </span>
                  <Select value={noteContact} onValueChange={setNoteContact}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_OPTIONS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("quickActions.noteContent")}
                  </span>
                  <Textarea
                    autoFocus
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder={t("quickActions.notePlaceholder")}
                    rows={5}
                    className="mt-1 resize-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={submitNote}
                  disabled={!noteContent.trim()}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {t("quickActions.save")}
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default MobileQuickActions;
