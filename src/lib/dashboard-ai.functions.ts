import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getAtRiskContactsTool,
  getOverdueTasksTool,
  getPipelineSummaryTool,
  getTaskSummaryTool,
} from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  force: z.boolean().default(false),
  organizationId: z.string().nullable().default(null),
});

export const DASHBOARD_SYSTEM_PROMPTS = {
  fr: "Tu es le partenaire quotidien bienveillant de l'utilisateur pour son CRM — pense associé encourageant, pas analyste froid. Utilise les outils disponibles pour récupérer ses tâches et son pipeline réels. Réponds en markdown chaleureux et naturel : commence par une phrase d'ouverture qui l'oriente pour aujourd'hui (pas de salutation générique type « Bonjour »), puis une section **Next steps** avec une liste numérotée de 2 à 3 actions concrètes, chacune en une phrase qui nomme l'action ET la raison pour laquelle elle compte (ex. « Appelle Acme — leur renouvellement est dans 3 jours et ils ne répondent plus »). Sonne comme un partenaire utile, pas un rapport. Maximum 110 mots au total. Pas de conclusion, pas de remplissage, pas de fragments sans contexte.",
  en: "You are the user's supportive daily CRM partner — think encouraging co-founder, not a cold analyst. Use the available tools to fetch their real tasks and pipeline. Reply in warm, natural markdown: start with a short opening sentence that orients them for today (no generic greeting like 'Good morning'), then a **Next steps** section with a numbered list of 2-3 concrete actions, each one sentence that names the action AND the reason it matters (e.g. 'Call Acme — their renewal is in 3 days and they've gone quiet'). Sound like a helpful partner, not a report. Maximum 110 words total. No conclusion, no filler, no context-free fragments.",
  es: "Eres el compañero diario y cercano del usuario para su CRM — piensa en un socio que anima, no un analista frío. Usa las herramientas disponibles para obtener sus tareas y su pipeline reales. Responde en markdown cálido y natural: empieza con una frase de apertura que lo oriente para hoy (sin saludos genéricos tipo «Buenos días»), luego una sección **Next steps** con una lista numerada de 2 a 3 acciones concretas, cada una en una frase que nombra la acción Y la razón por la que importa (ej. «Llama a Acme — su renovación es en 3 días y han dejado de responder»). Suena como un compañero útil, no un informe. Máximo 110 palabras en total. Sin conclusión, sin relleno, sin fragmentos sin contexto.",
};

export const DASHBOARD_USER_PROMPTS = {
  fr: "Regarde mes tâches et mon pipeline du jour, puis aide-moi à démarrer la journée — sur quoi devrais-je me concentrer et pourquoi ?",
  en: "Look at my tasks and pipeline for today, then help me start the day — what should I focus on and why?",
  es: "Mira mis tareas y mi pipeline de hoy, luego ayúdame a empezar el día — ¿en qué debería enfocarme y por qué?",
};

export const analyzeDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[dashboard-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "dashboard",
        `${data.organizationId ?? "all"}:${data.language}`,
        data.force,
        async () => {
          const markdown = await runCrmAgent({
            apiKey: key,
            system: DASHBOARD_SYSTEM_PROMPTS[data.language],
            prompt: DASHBOARD_USER_PROMPTS[data.language],
            tools: [
              getTaskSummaryTool(supabase, userId),
              getOverdueTasksTool(supabase, userId),
              getPipelineSummaryTool(supabase, data.organizationId),
              getAtRiskContactsTool(supabase, data.organizationId),
            ],
            maxTokens: 1024,
          });
          return { markdown };
        },
      );
    } catch (err: unknown) {
      console.error("[dashboard-ai] agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      if (err instanceof Anthropic.APIError && /credit balance/i.test(err.message)) {
        throw new Error("CREDITS_EXHAUSTED");
      }
      throw new Error("AI_ERROR");
    }
  });
