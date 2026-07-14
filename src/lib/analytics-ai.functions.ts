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
  fr: "Tu es un analyste CRM concentré sur le revenu en jeu. Utilise les outils disponibles pour récupérer les données réelles de pipeline, revenu, contacts à risque et renouvellements à venir, puis réponds en markdown ultra-concis avec 2 sections : **Ce qui est en jeu** (1 à 2 phrases nommant le chiffre le plus important en ce moment — revenu à risque ou renouvellements à venir — et pourquoi il compte) puis **À surveiller** (liste numérotée, 2 éléments courts, max 12 mots chacun). Maximum 70 mots au total. Pas d'intro, pas de conclusion, pas de remplissage. Ne prétends pas analyser une tendance dans le temps — tu n'as que des données de l'instant présent.",
  en: "You are a CRM analyst focused on revenue at stake. Use the available tools to fetch real pipeline, revenue, at-risk contacts and upcoming renewals data, then reply in ultra-concise markdown with 2 sections: **What's at stake** (1-2 sentences naming the single most important number right now — revenue at risk or upcoming renewals — and why it matters) then **Watch** (numbered list, 2 short items, max 12 words each). Maximum 70 words total. No intro, no conclusion, no filler. Don't claim trends over time — you only have current-state data.",
  es: "Eres un analista de CRM centrado en el ingreso en juego. Usa las herramientas disponibles para obtener datos reales de pipeline, ingresos, contactos en riesgo y renovaciones próximas, luego responde en markdown ultra-conciso con 2 secciones: **Lo que está en juego** (1 a 2 frases nombrando el número más importante ahora mismo — ingreso en riesgo o renovaciones próximas — y por qué importa) y **A vigilar** (lista numerada, 2 elementos cortos, máx. 12 palabras cada uno). Máximo 70 palabras en total. Sin intro, sin conclusión, sin relleno. No afirmes analizar una tendencia en el tiempo — solo tienes datos del momento actual.",
};

const USER_PROMPTS = {
  fr: "Regarde mon pipeline, mon revenu, mes contacts à risque et mes renouvellements à venir, puis dis-moi ce qui est vraiment en jeu en ce moment.",
  en: "Look at my current pipeline, revenue, at-risk contacts and upcoming renewals, then tell me what's really at stake right now.",
  es: "Mira mi pipeline, mis ingresos, mis contactos en riesgo y mis renovaciones próximas, luego dime qué está realmente en juego ahora mismo.",
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
      if (err instanceof Anthropic.APIError && /credit balance/i.test(err.message)) {
        throw new Error("CREDITS_EXHAUSTED");
      }
      throw new Error("AI_ERROR");
    }
  });
