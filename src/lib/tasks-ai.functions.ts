import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getOverdueTasksTool,
  getTaskSummaryTool,
  getUpcomingTasksTool,
} from "@/lib/crm-ai-tools.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
});

const SYSTEM_PROMPTS = {
  fr: "Tu es un analyste CRM. Utilise les outils disponibles pour récupérer les tâches réelles de l'utilisateur, puis réponds en markdown ultra-concis avec 2 sections : **Diagnostic** (1 phrase max) puis **Next steps** (liste numérotée de 2 actions courtes, max 12 mots chacune). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM analyst. Use the available tools to fetch the user's real tasks, then reply in ultra-concise markdown with 2 sections: **Diagnosis** (1 sentence max) then **Next steps** (numbered list, 2 short actions, max 12 words each). Maximum 60 words total. No intro, no conclusion, no filler.",
  es: "Eres un analista CRM. Usa las herramientas disponibles para obtener las tareas reales del usuario, luego responde en markdown ultra-conciso con 2 secciones: **Diagnóstico** (1 frase máx.) y **Próximos pasos** (lista numerada, 2 acciones cortas, máx. 12 palabras cada una). Máximo 60 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const USER_PROMPTS = {
  fr: "Analyse ma charge de tâches actuelle et fournis un diagnostic avec les prochaines actions prioritaires.",
  en: "Analyze my current task workload and provide a diagnosis with the next priority actions.",
  es: "Analiza mi carga de tareas actual y proporciona un diagnóstico con las próximas acciones prioritarias.",
};

export const analyzeTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const tools = {
      getTaskSummary: getTaskSummaryTool(supabase, userId),
      getOverdueTasks: getOverdueTasksTool(supabase, userId),
      getUpcomingTasks: getUpcomingTasksTool(supabase, userId),
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
