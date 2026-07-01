import { createServerFn } from "@tanstack/react-start";
import { generateText, tool } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM. Utilise les outils disponibles pour récupérer les données réelles des revendeurs, puis réponds en markdown ultra-concis avec 2 sections : **Diagnostic** (1 phrase max) puis **Next steps** (liste numérotée de 2 actions courtes, max 12 mots chacune). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM analyst. Use the available tools to fetch real reseller data, then reply in ultra-concise markdown with 2 sections: **Diagnosis** (1 sentence max) then **Next steps** (numbered list, 2 short actions, max 12 words each). Maximum 60 words total. No intro, no conclusion, no filler.",
  es: "Eres un analista CRM. Usa las herramientas disponibles para obtener datos reales de los revendedores, luego responde en markdown ultra-conciso con 2 secciones: **Diagnóstico** (1 frase máx.) y **Próximos pasos** (lista numerada, 2 acciones cortas, máx. 12 palabras cada una). Máximo 60 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const USER_PROMPTS = {
  fr: "Analyse le portefeuille de revendeurs et fournis un diagnostic avec les prochaines actions prioritaires.",
  en: "Analyze the reseller portfolio and provide a diagnosis with the next priority actions.",
  es: "Analiza el portafolio de revendedores y proporciona un diagnóstico con las próximas acciones prioritarias.",
};

export const analyzeResellers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase } = context;
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const tools = {
      getResellers: tool({
        description: "Get all active resellers with their name, company, confidence level, and number of contacts",
        parameters: z.object({}),
        execute: async () => {
          const { data: resellers } = await supabase
            .from("resellers")
            .select("id, name, company, confidence_level, reseller_contacts(count)")
            .is("archived_at", null)
            .order("created_at", { ascending: false });
          return { resellers: resellers ?? [], count: resellers?.length ?? 0 };
        },
      }),
      getResellerRevenue: tool({
        description: "Get MRR and deal value aggregated per reseller via their contacts",
        parameters: z.object({}),
        execute: async () => {
          const { data: rc } = await supabase
            .from("reseller_contacts")
            .select("reseller_id, resellers(name), contacts(subscription_details(deal_value, mrr))");
          if (!rc) return { resellerRevenue: [] };

          const byReseller: Record<string, { name: string; totalMrr: number; totalDeal: number; contacts: number }> = {};
          for (const row of rc) {
            const rid = row.reseller_id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rname = (row.resellers as any)?.name ?? "Unknown";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subs = (row.contacts as any)?.subscription_details;
            const mrr = Number(subs?.mrr) || 0;
            const deal = Number(subs?.deal_value) || 0;
            if (!byReseller[rid]) byReseller[rid] = { name: rname, totalMrr: 0, totalDeal: 0, contacts: 0 };
            byReseller[rid].totalMrr += mrr;
            byReseller[rid].totalDeal += deal;
            byReseller[rid].contacts += 1;
          }
          return { resellerRevenue: Object.values(byReseller) };
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
