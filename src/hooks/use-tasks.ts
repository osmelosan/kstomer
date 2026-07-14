import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./use-current-user";

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  contact: string | null;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
};

export function useTasks() {
  const { user } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as Task[];
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchTasks(user.id).then((rows) => {
      if (!cancelled) {
        setTasks(rows);
        setLoading(false);
      }
    });

    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        () => {
          fetchTasks(user.id).then((rows) => {
            if (!cancelled) setTasks(rows);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks]);

  const createTask = useCallback(
    async (data: { title: string; priority: TaskPriority; dueDate: string; contact?: string }) => {
      if (!user) return null;
      const { data: created } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: data.title,
          priority: data.priority,
          due_date: data.dueDate,
          contact: data.contact ?? null,
        })
        .select()
        .single();
      if (created) {
        setTasks((prev) => [created as Task, ...prev]);
        return created as Task;
      }
      return null;
    },
    [user],
  );

  const updateTask = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Task, "title" | "contact" | "due_date" | "priority" | "status">>,
    ) => {
      const { data } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
      }
      return data as Task | null;
    },
    [],
  );

  const toggleDone = useCallback(
    (task: Task) => updateTask(task.id, { status: task.status === "done" ? "todo" : "done" }),
    [updateTask],
  );

  return { tasks, loading, createTask, updateTask, toggleDone };
}
