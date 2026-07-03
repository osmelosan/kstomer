import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getOverdueTasksTool,
  getTaskSummaryTool,
  getUpcomingTasksTool,
} from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

// Only "tasks" is prewarmed here: its tools filter explicitly by user_id, so
// running them under the service-role client for every user is safe. The
// other AI cards (dashboard's pipeline/at-risk tools, analytics, resellers,
// prospects) rely on RLS account-scoping with no explicit account filter,
// so batch-running them with the service role would mix data across
// tenants — they stay on lazy cache-on-read only.
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

        let warmed = 0;
        let errors = 0;
        let page = 1;
        const perPage = 200;

        for (;;) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
          if (error) {
            console.error("[cron/warm-ai-cache] listUsers failed:", error);
            break;
          }
          const users = data?.users ?? [];
          if (users.length === 0) break;

          for (const user of users) {
            try {
              await warmTasksForUser(user.id, apiKey);
              warmed += 1;
            } catch (err) {
              errors += 1;
              console.error(`[cron/warm-ai-cache] failed for user ${user.id}:`, err);
            }
          }

          if (users.length < perPage) break;
          page += 1;
        }

        return Response.json({ warmed, errors });
      },
    },
  },
});
