import { createServerFn } from "@tanstack/react-start";
import { generateText, tool } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase } = context;
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const tools = {
      getPipelineSummary: tool({
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
      }),
      getRevenueMetrics: tool({
        description: "Get revenue metrics: total MRR, total deal value, count of active subscriptions",
        parameters: z.object({}),
        execute: async () => {
          const { data: subs } = await supabase
            .from("subscription_details")
            .select("deal_value, mrr");
          if (!subs) return { totalMrr: 0, totalDealValue: 0, count: 0 };
          const totalMrr = subs.reduce((acc, s) => acc + (Number(s.mrr) || 0), 0);
          const totalDealValue = subs.reduce((acc, s) => acc + (Number(s.deal_value) || 0), 0);
          return { totalMrr, totalDealValue, count: subs.length };
        },
      }),
      getAtRiskContacts: tool({
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
      }),
      getUpcomingRenewals: tool({
        description: "Get contacts with renewal dates in the next 30 days",
        parameters: z.object({}),
        execute: async () => {
          const until = new Date();
          until.setDate(until.getDate() + 30);
          const { data: contacts } = await supabase
            .from("contacts")
            .select("contact_name, company_name, renewal_date")
            .gte("renewal_date", new Date().toISOString())
            .lte("renewal_date", until.toISOString())
            .is("archived_at", null)
            .order("renewal_date", { ascending: true });
          return { contacts: contacts ?? [], count: contacts?.length ?? 0 };
        },
      }),
    };

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: SYSTEM_PROMPTS[data.language],
        prompt: USER_PROMPTS[data.language],
        tools,
        maxSteps: 5,
        maxOutputTokens: 300,
      });
      return { markdown: text };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("429")) throw new Error("RATE_LIMIT");
      if (message.includes("402")) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
