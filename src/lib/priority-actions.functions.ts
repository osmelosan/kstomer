import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PriorityAction = {
  id: string;
  title: string;
  contact: string | null;
  dueDate: string;
  priority: string;
  overdue: boolean;
};

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const getPriorityActions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ actions: PriorityAction[] }> => {
    const { supabase, userId } = context;
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, contact, due_date, priority, status")
      .eq("user_id", userId)
      .neq("status", "done");

    const now = Date.now();
    const actions: PriorityAction[] = (tasks ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      contact: t.contact,
      dueDate: t.due_date,
      priority: t.priority,
      overdue: new Date(t.due_date).getTime() < now,
    }));

    actions.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      const pa = PRIORITY_RANK[a.priority] ?? 1;
      const pb = PRIORITY_RANK[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return { actions: actions.slice(0, 3) };
  });
