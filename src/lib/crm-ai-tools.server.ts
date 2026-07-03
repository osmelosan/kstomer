import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supa = SupabaseClient<Database>;

export type CrmTool = {
  definition: Anthropic.Tool;
  execute: () => Promise<unknown>;
};

export function getPipelineSummaryTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getPipelineSummary",
      description: "Get the count of contacts by pipeline stage",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      let q = supabase.from("contacts").select("stage").is("archived_at", null);
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: contacts } = await q;
      if (!contacts) return { stages: {}, total: 0 };
      const stages: Record<string, number> = {};
      for (const c of contacts) {
        stages[c.stage] = (stages[c.stage] ?? 0) + 1;
      }
      return { stages, total: contacts.length };
    },
  };
}

export function getAtRiskContactsTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getAtRiskContacts",
      description: "Get contacts in the at_risk stage that need urgent attention",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      let q = supabase
        .from("contacts")
        .select("contact_name, company_name, last_contact_date, confidence_level")
        .eq("stage", "at_risk")
        .is("archived_at", null)
        .order("last_contact_date", { ascending: true })
        .limit(10);
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: contacts } = await q;
      return { contacts: contacts ?? [], count: contacts?.length ?? 0 };
    },
  };
}

export function getTaskSummaryTool(supabase: Supa, userId: string): CrmTool {
  return {
    definition: {
      name: "getTaskSummary",
      description:
        "Get the count of the current user's tasks by status and priority, plus the overdue count",
      input_schema: { type: "object", properties: {} },
    },
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
  };
}

export function getOverdueTasksTool(supabase: Supa, userId: string): CrmTool {
  return {
    definition: {
      name: "getOverdueTasks",
      description:
        "Get the current user's overdue, not-done tasks with title, due date, priority and linked contact",
      input_schema: { type: "object", properties: {} },
    },
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
  };
}

export function getUpcomingTasksTool(supabase: Supa, userId: string): CrmTool {
  return {
    definition: {
      name: "getUpcomingTasks",
      description:
        "Get the current user's not-done tasks due in the next 7 days, with title, due date and priority",
      input_schema: { type: "object", properties: {} },
    },
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
  };
}

export function getResellersTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getResellers",
      description:
        "Get all active resellers with their name, company, confidence level, and number of contacts",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      let q = supabase
        .from("resellers")
        .select("id, name, company, confidence_level, reseller_contacts(count)")
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: resellers } = await q;
      return { resellers: resellers ?? [], count: resellers?.length ?? 0 };
    },
  };
}

export function getResellerRevenueTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getResellerRevenue",
      description: "Get MRR and deal value aggregated per reseller via their contacts",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      let q = supabase
        .from("reseller_contacts")
        .select("reseller_id, resellers(name), contacts(subscription_details(deal_value, mrr))");
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: rc } = await q;
      if (!rc) return { resellerRevenue: [] };

      const byReseller: Record<
        string,
        { name: string; totalMrr: number; totalDeal: number; contacts: number }
      > = {};
      for (const row of rc) {
        const rid = row.reseller_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rname = (row.resellers as any)?.name ?? "Unknown";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subs = (row.contacts as any)?.subscription_details;
        const mrr = Number(subs?.mrr) || 0;
        const deal = Number(subs?.deal_value) || 0;
        if (!byReseller[rid])
          byReseller[rid] = { name: rname, totalMrr: 0, totalDeal: 0, contacts: 0 };
        byReseller[rid].totalMrr += mrr;
        byReseller[rid].totalDeal += deal;
        byReseller[rid].contacts += 1;
      }
      return { resellerRevenue: Object.values(byReseller) };
    },
  };
}

export function getRevenueMetricsTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getRevenueMetrics",
      description:
        "Get revenue metrics: total MRR, total deal value, count of active subscriptions",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      let q = supabase.from("subscription_details").select("deal_value, mrr");
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: subs } = await q;
      if (!subs) return { totalMrr: 0, totalDealValue: 0, count: 0 };
      const totalMrr = subs.reduce((acc, s) => acc + (Number(s.mrr) || 0), 0);
      const totalDealValue = subs.reduce((acc, s) => acc + (Number(s.deal_value) || 0), 0);
      return { totalMrr, totalDealValue, count: subs.length };
    },
  };
}

export function getUpcomingRenewalsTool(supabase: Supa, organizationId: string | null): CrmTool {
  return {
    definition: {
      name: "getUpcomingRenewals",
      description: "Get contacts with renewal dates in the next 30 days",
      input_schema: { type: "object", properties: {} },
    },
    execute: async () => {
      const until = new Date();
      until.setDate(until.getDate() + 30);
      let q = supabase
        .from("contacts")
        .select("contact_name, company_name, renewal_date")
        .gte("renewal_date", new Date().toISOString())
        .lte("renewal_date", until.toISOString())
        .is("archived_at", null)
        .order("renewal_date", { ascending: true });
      if (organizationId) q = q.eq("organization_id", organizationId);
      const { data: contacts } = await q;
      return { contacts: contacts ?? [], count: contacts?.length ?? 0 };
    },
  };
}
