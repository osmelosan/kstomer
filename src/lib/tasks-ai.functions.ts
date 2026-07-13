import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getOverdueTasksTool,
  getTaskSummaryTool,
  getUpcomingTasksTool,
} from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  force: z.boolean().default(false),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un assistant de triage de charge de travail CRM. Utilise les outils disponibles pour récupérer les tâches réelles de l'utilisateur, puis réponds en markdown ultra-concis : une section **Priorité du jour** avec une liste numérotée des 2 à 3 tâches à faire en premier, classées par urgence (en retard d'abord, puis échéance la plus proche), en regroupant les tâches similaires quand c'est pertinent (ex. « Lot : 3 appels de suivi »). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM workload triage assistant. Use the available tools to fetch the user's real tasks, then reply in ultra-concise markdown: a **Priority today** section with a numbered list of the top 2-3 tasks to tackle first, ranked by urgency (overdue first, then soonest due), grouping similar tasks together when relevant (e.g. 'Batch: 3 follow-up calls'). Maximum 60 words total. No intro, no conclusion, no filler.",
  es: "Eres un asistente de clasificación de carga de tareas del CRM. Usa las herramientas disponibles para obtener las tareas reales del usuario, luego responde en markdown ultra-conciso: una sección **Prioridad de hoy** con una lista numerada de las 2 a 3 tareas a hacer primero, ordenadas por urgencia (vencidas primero, luego la fecha más próxima), agrupando tareas similares cuando sea relevante (ej. «Lote: 3 llamadas de seguimiento»). Máximo 60 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const USER_PROMPTS = {
  fr: "Regarde ma charge de tâches actuelle et dis-moi exactement par quoi commencer aujourd'hui.",
  en: "Look at my current task workload and tell me exactly what to tackle first today.",
  es: "Mira mi carga de tareas actual y dime exactamente por dónde empezar hoy.",
};

export const analyzeTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[tasks-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "tasks",
        data.language,
        data.force,
        async () => {
          const markdown = await runCrmAgent({
            apiKey: key,
            system: SYSTEM_PROMPTS[data.language],
            prompt: USER_PROMPTS[data.language],
            tools: [
              getTaskSummaryTool(supabase, userId),
              getOverdueTasksTool(supabase, userId),
              getUpcomingTasksTool(supabase, userId),
            ],
            maxTokens: 1024,
          });
          return { markdown };
        },
      );
    } catch (err: unknown) {
      console.error("[tasks-ai] agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
