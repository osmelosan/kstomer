import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  resellers: z
    .array(
      z.object({
        name: z.string(),
        tier: z.string(),
        deals: z.number(),
        revenue: z.string(),
        health: z.number(),
      }),
    )
    .min(1),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM senior. À partir d'un portefeuille de revendeurs, fournis une analyse concise structurée en 3 sections markdown : **Diagnostic** (2-3 phrases), **Opportunités** (liste à puces, 2-3 items), **Next steps** (liste à puces numérotée, 3 actions concrètes et priorisées). Sois direct, factuel, orienté action. Pas d'introduction ni de conclusion.",
  en: "You are a senior CRM analyst. From a reseller portfolio, provide a concise analysis in 3 markdown sections: **Diagnosis** (2-3 sentences), **Opportunities** (bullet list, 2-3 items), **Next steps** (numbered list, 3 concrete prioritized actions). Be direct, factual, action-oriented. No intro or conclusion.",
  es: "Eres un analista CRM senior. A partir de una cartera de distribuidores, proporciona un análisis conciso en 3 secciones markdown: **Diagnóstico** (2-3 frases), **Oportunidades** (lista, 2-3 elementos), **Próximos pasos** (lista numerada, 3 acciones concretas priorizadas). Sé directo, factual, orientado a la acción. Sin introducción ni conclusión.",
};

export const analyzeResellers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const portfolio = data.resellers
      .map(
        (r) =>
          `- ${r.name} | Tier: ${r.tier} | Deals: ${r.deals} | Revenue: ${r.revenue} | Health: ${r.health}/5`,
      )
      .join("\n");

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: SYSTEM_PROMPTS[data.language],
        prompt: `Portefeuille:\n${portfolio}`,
      });
      return { markdown: text };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("429")) throw new Error("RATE_LIMIT");
      if (message.includes("402")) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
