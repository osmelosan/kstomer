import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import i18n from "@/lib/i18n";
import { MOCK_TASKS, type Task, type TaskPriority, type TaskStatus } from "@/lib/mock-tasks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: i18n.t("tasks.metaTitle") },
      { name: "description", content: i18n.t("tasks.subtitle") },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (status !== "all" && task.status !== status) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${t(task.titleKey)} ${t(task.subtitleKey)} ${task.contact ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, status, priority, query, t]);

  const toggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "done" ? "todo" : "done" }
          : task,
      ),
    );
  };

  const handleCreate = (data: { title: string; priority: TaskPriority; dueDate: string }) => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      titleKey: data.title,
      subtitleKey: "",
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
      priority: data.priority,
      status: "todo",
    };
    setTasks((prev) => [newTask, ...prev]);
    setOpen(false);
    toast.success(t("tasks.created"));
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

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-card">
          <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("tasks.empty")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-card">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task.id)} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const { t, i18n: i18nInst } = useTranslation();
  const done = task.status === "done";
  const due = new Date(task.dueDate);
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
    <div className={cn("flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors group", done && "opacity-60")}>
      <div className={cn("w-1 self-stretch rounded-full", accentBar[task.priority])} />
      <Checkbox checked={done} onCheckedChange={onToggle} aria-label="Toggle task" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", done && "line-through")}>
          {/* Allow free text fallback when titleKey is a plain string with no translation */}
          {t(task.titleKey, { defaultValue: task.titleKey })}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {task.contact && (
            <span className="inline-flex items-center gap-1">
              <User2 className="h-3 w-3" /> {task.contact}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1", overdue && "text-destructive font-medium")}>
            <CalendarIcon className="h-3 w-3" />
            {due.toLocaleDateString(i18nInst.language, { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border", priorityClass[task.priority])}>
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
          <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
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
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
