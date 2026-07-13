import { pageHead } from "@/lib/route-seo";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import i18n from "@/lib/i18n";
import { useTasks, type Task, type TaskPriority, type TaskStatus } from "@/hooks/use-tasks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, CheckSquare, Calendar as CalendarIcon, User2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeTasks } from "@/lib/tasks-ai.functions";
import { AiInsightCard, type AiInsightStatus } from "@/components/AiInsightCard";

type TasksSearch = { focus?: string };

export const Route = createFileRoute("/_authenticated/tasks")({
  validateSearch: (search: Record<string, unknown>): TasksSearch => ({
    focus: typeof search.focus === "string" ? search.focus : undefined,
  }),
  head: () =>
    pageHead({
      routeKey: "tasks",
      title: i18n.t("tasks.metaTitle"),
      path: "/tasks",
      noindex: true,
    }),
  component: TasksPage,
});

function TasksPage() {
  const { t } = useTranslation();
  const { focus } = Route.useSearch();
  const { tasks, loading, createTask, toggleDone } = useTasks();
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | undefined>(focus);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset filters when arriving with a focus param so the row is visible
  useEffect(() => {
    if (!focus) return;
    setStatus("all");
    setPriority("all");
    setQuery("");
    setHighlight(focus);
    const id = window.setTimeout(() => {
      rowRefs.current[focus]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    const clear = window.setTimeout(() => setHighlight(undefined), 2400);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(clear);
    };
  }, [focus]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (status !== "all" && task.status !== status) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${task.title} ${task.contact ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, status, priority, query]);

  const handleCreate = async (data: { title: string; priority: TaskPriority; dueDate: string }) => {
    const created = await createTask({
      title: data.title,
      priority: data.priority,
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
    });
    if (created) {
      setOpen(false);
      toast.success(t("tasks.created"));
    }
  };

  return (
    <AppShell
      title={t("tasks.title")}
      subtitle={t("tasks.subtitle")}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> {t("tasks.new")}
            </button>
          </DialogTrigger>
          <NewTaskDialog onCreate={handleCreate} onCancel={() => setOpen(false)} />
        </Dialog>
      }
    >
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as TaskStatus | "all")}>
          <TabsList>
            <TabsTrigger value="all">{t("tasks.filters.all")}</TabsTrigger>
            <TabsTrigger value="todo">{t("tasks.filters.todo")}</TabsTrigger>
            <TabsTrigger value="in_progress">{t("tasks.filters.inProgress")}</TabsTrigger>
            <TabsTrigger value="done">{t("tasks.filters.done")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Input
            placeholder={t("tasks.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority | "all")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.priority.all")}</SelectItem>
              <SelectItem value="high">{t("tasks.priority.high")}</SelectItem>
              <SelectItem value="medium">{t("tasks.priority.medium")}</SelectItem>
              <SelectItem value="low">{t("tasks.priority.low")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AIInsightsCard />

      {loading ? null : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-card">
          <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("tasks.empty")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-card">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleDone(task)}
              highlighted={highlight === task.id}
              rowRef={(el) => {
                rowRefs.current[task.id] = el;
              }}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TaskRow({
  task,
  onToggle,
  highlighted,
  rowRef,
}: {
  task: Task;
  onToggle: () => void;
  highlighted?: boolean;
  rowRef?: (el: HTMLDivElement | null) => void;
}) {
  const { t, i18n: i18nInst } = useTranslation();
  const done = task.status === "done";
  const due = new Date(task.due_date);
  const overdue = !done && due.getTime() < Date.now();

  const priorityClass: Record<TaskPriority, string> = {
    high: "bg-warning-soft text-warning-foreground border-warning/30",
    medium: "bg-secondary/10 text-secondary border-secondary/20",
    low: "bg-muted text-muted-foreground border-border",
  };

  const accentBar: Record<TaskPriority, string> = {
    high: "bg-warning",
    medium: "bg-secondary",
    low: "bg-border",
  };

  return (
    <div
      ref={rowRef}
      className={cn(
        "flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors group",
        done && "opacity-60",
        highlighted && "bg-secondary/10 ring-2 ring-secondary/40 animate-pulse",
      )}
    >
      <div className={cn("w-1 self-stretch rounded-full", accentBar[task.priority])} />
      <Checkbox checked={done} onCheckedChange={onToggle} aria-label="Toggle task" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", done && "line-through")}>{task.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {task.contact && (
            <span className="inline-flex items-center gap-1">
              <User2 className="h-3 w-3" /> {task.contact}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "text-destructive font-medium",
            )}
          >
            <CalendarIcon className="h-3 w-3" />
            {due.toLocaleDateString(i18nInst.language, { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
      <span
        className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border",
          priorityClass[task.priority],
        )}
      >
        {t(`tasks.priority.${task.priority}`)}
      </span>
    </div>
  );
}

function NewTaskDialog({
  onCreate,
  onCancel,
}: {
  onCreate: (data: { title: string; priority: TaskPriority; dueDate: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), priority, dueDate });
    setTitle("");
    setPriority("medium");
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("tasks.new")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="task-title">{t("tasks.form.title")}</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("tasks.form.priority")}</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">{t("tasks.priority.high")}</SelectItem>
                <SelectItem value="medium">{t("tasks.priority.medium")}</SelectItem>
                <SelectItem value="low">{t("tasks.priority.low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due">{t("tasks.form.dueDate")}</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <button
          onClick={onCancel}
          className="h-10 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted"
        >
          {t("tasks.form.cancel")}
        </button>
        <button
          onClick={submit}
          disabled={!title.trim()}
          className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50"
        >
          {t("tasks.form.create")}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

function AIInsightsCard() {
  const { t, i18n: i18nInstance } = useTranslation();
  const analyze = useServerFn(analyzeTasks);
  const [status, setStatus] = useState<AiInsightStatus>("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [errorKey, setErrorKey] = useState<string>("tasks.ai.errorGeneric");

  const run = async (force: boolean) => {
    setStatus("loading");
    try {
      const lang = (i18nInstance.language?.slice(0, 2) ?? "fr") as "fr" | "en" | "es";
      const safeLang = (["fr", "en", "es"] as const).includes(lang) ? lang : "fr";
      const result = await analyze({
        data: {
          language: safeLang,
          force,
        },
      });
      setMarkdown(result.markdown);
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("RATE_LIMIT")) setErrorKey("tasks.ai.errorRate");
      else if (msg.includes("CREDITS_EXHAUSTED")) setErrorKey("tasks.ai.errorCredits");
      else setErrorKey("tasks.ai.errorGeneric");
      setStatus("error");
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AiInsightCard
      title={t("tasks.ai.title")}
      disclaimer={t("tasks.ai.disclaimer")}
      status={status}
      markdown={markdown}
      errorMessage={t(errorKey)}
      loadingLabel={t("tasks.ai.loading")}
      regenerateLabel={t("tasks.ai.regenerate")}
      onRegenerate={() => run(true)}
    />
  );
}
