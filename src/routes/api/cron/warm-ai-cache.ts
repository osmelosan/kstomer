import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getAtRiskContactsTool,
  getOverdueTasksTool,
  getPipelineSummaryTool,
  getTaskSummaryTool,
  getUpcomingTasksTool,
} from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";
import { DASHBOARD_SYSTEM_PROMPTS, DASHBOARD_USER_PROMPTS } from "@/lib/dashboard-ai.functions";
import { generateProspects, type OrgProfile } from "@/lib/prospects-ai.server";

// Only scopes that resolve to an explicit, filtered account are prewarmed
// here. "tasks" tools always filter by user_id, so they're safe for any
// user under the service-role client. The dashboard's pipeline/at-risk
// tools only filter by organization_id when one is passed explicitly — with
// no organizationId they rely on RLS account-scoping, which the
// service-role client bypasses. So "dashboard" is only prewarmed per real
// organization (never the "all companies" null scope), keyed to that
// organization's owner. "prospects" is prewarmed the same way, skipping
// organizations without a description/city (mirrors analyzeProspects'
// MISSING_PROFILE guard). Other AI cards (analytics, resellers) stay on
// lazy cache-on-read only.
const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM. Utilise les outils disponibles pour récupérer les tâches réelles de l'utilisateur, puis réponds en markdown ultra-concis avec 2 sections : **Diagnostic** (1 phrase max) puis **Next steps** (liste numérotée de 2 actions courtes, max 12 mots chacune). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
};

const USER_PROMPT =
  "Analyse ma charge de tâches actuelle et fournis un diagnostic avec les prochaines actions prioritaires.";

async function warmTasksForUser(userId: string, apiKey: string): Promise<void> {
  await getCachedOrGenerate(supabaseAdmin, userId, "tasks", "fr", true, async () => {
    const markdown = await runCrmAgent({
      apiKey,
      system: SYSTEM_PROMPTS.fr,
      prompt: USER_PROMPT,
      tools: [
        getTaskSummaryTool(supabaseAdmin, userId),
        getOverdueTasksTool(supabaseAdmin, userId),
        getUpcomingTasksTool(supabaseAdmin, userId),
      ],
      maxTokens: 1024,
    });
    return { markdown };
  });
}

async function warmDashboardForOrg(ownerId: string, orgId: string, apiKey: string): Promise<void> {
  await getCachedOrGenerate(supabaseAdmin, ownerId, "dashboard", `${orgId}:fr`, true, async () => {
    const markdown = await runCrmAgent({
      apiKey,
      system: DASHBOARD_SYSTEM_PROMPTS.fr,
      prompt: DASHBOARD_USER_PROMPTS.fr,
      tools: [
        getTaskSummaryTool(supabaseAdmin, ownerId),
        getOverdueTasksTool(supabaseAdmin, ownerId),
        getPipelineSummaryTool(supabaseAdmin, orgId),
        getAtRiskContactsTool(supabaseAdmin, orgId),
      ],
      maxTokens: 1024,
    });
    return { markdown };
  });
}

async function warmProspectsForOrg(
  ownerId: string,
  orgId: string,
  org: OrgProfile,
  apiKey: string,
): Promise<void> {
  await getCachedOrGenerate(supabaseAdmin, ownerId, "prospects", `${orgId}:fr`, true, () =>
    generateProspects(apiKey, "fr", org),
  );
}

// The Vercel function has a 300s hard limit. Warming was previously a fully
// sequential loop over every user/org, each doing multiple LLM round trips —
// past a modest number of accounts that reliably exceeds 300s and the whole
// run gets killed mid-loop with no summary logged. Bounded concurrency plus a
// deadline check keeps each run fast and guarantees we stop starting new work
// (and still return a clean, logged summary) before Vercel kills the function.
const USER_CONCURRENCY = 8;
const ORG_CONCURRENCY = 4;
const DEADLINE_MS = 270_000;

async function runInBatches<T>(
  items: T[],
  concurrency: number,
  deadline: number,
  fn: (item: T) => Promise<void>,
): Promise<{ processed: number; truncated: boolean }> {
  let processed = 0;
  for (let i = 0; i < items.length; i += concurrency) {
    if (Date.now() >= deadline) return { processed, truncated: true };
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(fn));
    processed += batch.length;
  }
  return { processed, truncated: false };
}

export const Route = createFileRoute("/api/cron/warm-ai-cache")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const authHeader = request.headers.get("authorization");
          if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error("[cron/warm-ai-cache] Missing ANTHROPIC_API_KEY");
          return Response.json({ warmed: 0, errors: 0 });
        }

        const deadline = Date.now() + DEADLINE_MS;

        let warmed = 0;
        let errors = 0;
        let page = 1;
        const perPage = 200;
        let usersTruncated = false;

        for (;;) {
          if (Date.now() >= deadline) {
            usersTruncated = true;
            break;
          }
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
          if (error) {
            console.error("[cron/warm-ai-cache] listUsers failed:", error);
            break;
          }
          const users = data?.users ?? [];
          if (users.length === 0) break;

          const result = await runInBatches(users, USER_CONCURRENCY, deadline, async (user) => {
            try {
              await warmTasksForUser(user.id, apiKey);
              warmed += 1;
            } catch (err) {
              errors += 1;
              console.error(`[cron/warm-ai-cache] failed for user ${user.id}:`, err);
            }
          });
          if (result.truncated) usersTruncated = true;

          if (users.length < perPage || result.truncated) break;
          page += 1;
        }

        let dashboardWarmed = 0;
        let dashboardErrors = 0;
        let prospectsWarmed = 0;
        let prospectsErrors = 0;
        let orgsTruncated = false;

        if (Date.now() < deadline) {
          const { data: orgs, error: orgsError } = await supabaseAdmin
            .from("organizations")
            .select("id, owner_id, name, description, city, country");
          if (orgsError) {
            console.error("[cron/warm-ai-cache] list organizations failed:", orgsError);
          }

          const orgResult = await runInBatches(
            orgs ?? [],
            ORG_CONCURRENCY,
            deadline,
            async (org) => {
              try {
                await warmDashboardForOrg(org.owner_id, org.id, apiKey);
                dashboardWarmed += 1;
              } catch (err) {
                dashboardErrors += 1;
                console.error(`[cron/warm-ai-cache] failed for org ${org.id}:`, err);
              }

              if (!org.description && !org.city) return; // matches analyzeProspects' MISSING_PROFILE guard
              try {
                await warmProspectsForOrg(org.owner_id, org.id, org, apiKey);
                prospectsWarmed += 1;
              } catch (err) {
                prospectsErrors += 1;
                console.error(`[cron/warm-ai-cache] failed prospects for org ${org.id}:`, err);
              }
            },
          );
          orgsTruncated = orgResult.truncated;
        } else {
          orgsTruncated = true;
        }

        if (usersTruncated || orgsTruncated) {
          console.error("[cron/warm-ai-cache] hit deadline, run truncated", {
            usersTruncated,
            orgsTruncated,
          });
        }

        return Response.json({
          warmed,
          errors,
          dashboardWarmed,
          dashboardErrors,
          prospectsWarmed,
          prospectsErrors,
          truncated: usersTruncated || orgsTruncated,
        });
      },
    },
  },
});
