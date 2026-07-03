import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supa = SupabaseClient<Database>;

export function getPipelineSummaryTool(supabase: Supa) {
  return tool({
    description: "Get the count of contacts by pipeline stage",
    parameters: z.object({}),
    execute: async () => {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("stage")
        .is("archived_at", null);
      if (!contacts) return { stages: {}, total: 0 };
      const stages: Record<string, number> = {};
      for (const c of contacts) {
        stages[c.stage] = (stages[c.stage] ?? 0) + 1;
      }
      return { stages, total: contacts.length };
    },
  });
}

export function getAtRiskContactsTool(supabase: Supa) {
  return tool({
    description: "Get contacts in the at_risk stage that need urgent attention",
    parameters: z.object({}),
    execute: async () => {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("contact_name, company_name, last_contact_date, confidence_level")
        .eq("stage", "at_risk")
        .is("archived_at", null)
        .order("last_contact_date", { ascending: true })
        .limit(10);
      return { contacts: contacts ?? [], count: contacts?.length ?? 0 };
    },
  });
}

export function getTaskSummaryTool(supabase: Supa, userId: string) {
  return tool({
    description:
      "Get the count of the current user's tasks by status and priority, plus the overdue count",
    parameters: z.object({}),
    execute: async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("status, priority, due_date")
        .eq("user_id", userId);
      if (!tasks) return { byStatus: {}, byPriority: {}, overdue: 0, total: 0 };
      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      let overdue = 0;
      const now = Date.now();
      for (const t of tasks) {
        byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
        if (t.status !== "done" && new Date(t.due_date).getTime() < now) overdue += 1;
      }
      return { byStatus, byPriority, overdue, total: tasks.length };
    },
  });
}

export function getOverdueTasksTool(supabase: Supa, userId: string) {
  return tool({
    description:
      "Get the current user's overdue, not-done tasks with title, due date, priority and linked contact",
    parameters: z.object({}),
    execute: async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, contact, due_date, priority")
        .eq("user_id", userId)
        .neq("status", "done")
        .lt("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(10);
      return { tasks: tasks ?? [], count: tasks?.length ?? 0 };
    },
  });
}

export function getUpcomingTasksTool(supabase: Supa, userId: string) {
  return tool({
    description:
      "Get the current user's not-done tasks due in the next 7 days, with title, due date and priority",
    parameters: z.object({}),
    execute: async () => {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, contact, due_date, priority")
        .eq("user_id", userId)
        .neq("status", "done")
        .gte("due_date", new Date().toISOString())
        .lte("due_date", until.toISOString())
        .order("due_date", { ascending: true })
        .limit(10);
      return { tasks: tasks ?? [], count: tasks?.length ?? 0 };
    },
  });
}
