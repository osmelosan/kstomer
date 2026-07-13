import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getResellerRevenueTool, getResellersTool } from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  force: z.boolean().default(false),
  organizationId: z.string().nullable().default(null),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM concentré sur la santé du portefeuille de revendeurs. Utilise les outils disponibles pour récupérer les données réelles de revendeurs et de revenu, puis réponds en markdown ultra-concis avec 2 sections : **Concentration** (1 phrase indiquant comment le revenu est réparti entre les revendeurs, en signalant si l'un d'eux domine) puis **À contacter** (liste numérotée, 2 revendeurs à recontacter cette semaine, max 12 mots chacun avec une raison en un mot). Maximum 70 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM analyst focused on reseller portfolio health. Use the available tools to fetch real reseller and revenue data, then reply in ultra-concise markdown with 2 sections: **Concentration** (1 sentence naming how revenue is distributed across resellers, flagging if one dominates) then **Check in with** (numbered list, 2 resellers worth reaching out to this week, max 12 words each with a one-word reason). Maximum 70 words total. No intro, no conclusion, no filler.",
  es: "Eres un analista de CRM centrado en la salud del portafolio de revendedores. Usa las herramientas disponibles para obtener datos reales de revendedores e ingresos, luego responde en markdown ultra-conciso con 2 secciones: **Concentración** (1 frase indicando cómo se distribuye el ingreso entre los revendedores, señalando si uno domina) y **Para contactar** (lista numerada, 2 revendedores a contactar esta semana, máx. 12 palabras cada uno con una razón en una palabra). Máximo 70 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const USER_PROMPTS = {
  fr: "Regarde mon portefeuille de revendeurs et la répartition du revenu, puis parle-moi du risque de concentration et de qui contacter cette semaine.",
  en: "Look at my reseller portfolio and revenue distribution, then tell me about concentration risk and who to check in with this week.",
  es: "Mira mi portafolio de revendedores y la distribución del ingreso, luego cuéntame sobre el riesgo de concentración y a quién contactar esta semana.",
};

export const analyzeResellers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[resellers-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "resellers",
        `${data.organizationId ?? "all"}:${data.language}`,
        data.force,
        async () => {
          const markdown = await runCrmAgent({
            apiKey: key,
            system: SYSTEM_PROMPTS[data.language],
            prompt: USER_PROMPTS[data.language],
            tools: [
              getResellersTool(supabase, data.organizationId),
              getResellerRevenueTool(supabase, data.organizationId),
            ],
            maxTokens: 1024,
          });
          return { markdown };
        },
      );
    } catch (err: unknown) {
      console.error("[resellers-ai] agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
