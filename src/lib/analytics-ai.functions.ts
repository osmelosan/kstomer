import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getAtRiskContactsTool,
  getPipelineSummaryTool,
  getRevenueMetricsTool,
  getUpcomingRenewalsTool,
} from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  force: z.boolean().default(false),
  organizationId: z.string().nullable().default(null),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM. Utilise les outils disponibles pour récupérer les données réelles du CRM, puis réponds en markdown ultra-concis avec 2 sections : **Diagnostic** (1 phrase max) puis **Next steps** (liste numérotée de 2 actions courtes, max 12 mots chacune). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM analyst. Use the available tools to fetch real CRM data, then reply in ultra-concise markdown with 2 sections: **Diagnosis** (1 sentence max) then **Next steps** (numbered list, 2 short actions, max 12 words each). Maximum 60 words total. No intro, no conclusion, no filler.",
  es: "Eres un analista CRM. Usa las herramientas disponibles para obtener datos reales del CRM, luego responde en markdown ultra-conciso con 2 secciones: **Diagnóstico** (1 frase máx.) y **Próximos pasos** (lista numerada, 2 acciones cortas, máx. 12 palabras cada una). Máximo 60 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const USER_PROMPTS = {
  fr: "Analyse l'état actuel du CRM et fournis un diagnostic avec les prochaines actions prioritaires.",
  en: "Analyze the current state of the CRM and provide a diagnosis with the next priority actions.",
  es: "Analiza el estado actual del CRM y proporciona un diagnóstico con las próximas acciones prioritarias.",
};

export const analyzeAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[analytics-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "analytics",
        `${data.organizationId ?? "all"}:${data.language}`,
        data.force,
        async () => {
          const markdown = await runCrmAgent({
            apiKey: key,
            system: SYSTEM_PROMPTS[data.language],
            prompt: USER_PROMPTS[data.language],
            tools: [
              getPipelineSummaryTool(supabase, data.organizationId),
              getRevenueMetricsTool(supabase, data.organizationId),
              getAtRiskContactsTool(supabase, data.organizationId),
              getUpcomingRenewalsTool(supabase, data.organizationId),
            ],
            maxTokens: 1024,
          });
          return { markdown };
        },
      );
    } catch (err: unknown) {
      console.error("[analytics-ai] agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
