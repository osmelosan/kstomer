import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getContactProfileTool } from "@/lib/crm-ai-tools.server";
import { runCrmAgent } from "@/lib/run-crm-agent.server";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";

const HealthInputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  contactId: z.string(),
  force: z.boolean().default(false),
});

const DraftInputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  contactId: z.string(),
});

const HEALTH_SYSTEM_PROMPTS = {
  fr: "Tu es un coach relationnel CRM. Utilise l'outil getContactProfile pour récupérer le stade réel, la confiance, la dernière date de contact, la date de renouvellement et la note de ce contact, puis réponds en markdown ultra-concis avec 2 sections : **Dynamique** (1 phrase : se réchauffe, se refroidit ou stagne, et pourquoi) puis **Prochaine étape** (1 phrase : la meilleure action à mener et une date idéale pour la faire). Maximum 60 mots au total. Pas d'intro, pas de conclusion, pas de remplissage.",
  en: "You are a CRM relationship coach. Use the getContactProfile tool to fetch this contact's real stage, confidence, last contact date, renewal date and note, then reply in ultra-concise markdown with 2 sections: **Momentum** (1 sentence: warming, cooling or stalled, and why) then **Next step** (1 sentence: the single best action to take and an ideal date to do it by). Maximum 60 words total. No intro, no conclusion, no filler.",
  es: "Eres un coach de relaciones de CRM. Usa la herramienta getContactProfile para obtener el estado real, la confianza, la última fecha de contacto, la fecha de renovación y la nota de este contacto, luego responde en markdown ultra-conciso con 2 secciones: **Dinámica** (1 frase: se está calentando, enfriando o estancada, y por qué) y **Próximo paso** (1 frase: la mejor acción a realizar y una fecha ideal para hacerla). Máximo 60 palabras en total. Sin intro, sin conclusión, sin relleno.",
};

const HEALTH_USER_PROMPTS = {
  fr: "Analyse la santé de la relation avec ce contact et dis-moi la meilleure prochaine étape.",
  en: "Analyze this contact's relationship health and tell me the single best next step.",
  es: "Analiza la salud de la relación con este contacto y dime el mejor próximo paso.",
};

const DRAFT_SYSTEM_PROMPTS = {
  fr: "Tu es un assistant CRM qui rédige un message de suivi au nom de l'utilisateur. Utilise l'outil getContactProfile pour récupérer le stade réel, la dernière date de contact, la date de renouvellement et la note de ce contact, puis rédige un message de suivi court, chaleureux et personnalisé (longueur d'un email, 60 à 120 mots) dans la langue demandée, en faisant référence au contexte spécifique de la note/du stade/du renouvellement quand c'est pertinent. Ne produis que le texte du message — pas de titres markdown, pas de préambule, juste une formule de politesse simple en fin de message.",
  en: "You are a CRM assistant drafting a follow-up message on the user's behalf. Use the getContactProfile tool to fetch this contact's real stage, last contact date, renewal date and note, then write a short, warm, personalized follow-up message (email-length, 60-120 words) in the requested language, referencing specific context from the note/stage/renewal where relevant. Output only the message text — no markdown headers, no preamble, just a simple sign-off at the end.",
  es: "Eres un asistente de CRM que redacta un mensaje de seguimiento en nombre del usuario. Usa la herramienta getContactProfile para obtener el estado real, la última fecha de contacto, la fecha de renovación y la nota de este contacto, luego escribe un mensaje de seguimiento corto, cálido y personalizado (longitud de un correo, 60 a 120 palabras) en el idioma solicitado, haciendo referencia al contexto específico de la nota/el estado/la renovación cuando sea relevante. Produce solo el texto del mensaje — sin encabezados markdown, sin preámbulo, solo una despedida simple al final.",
};

const DRAFT_USER_PROMPTS = {
  fr: "Rédige un message de suivi pour ce contact.",
  en: "Draft a follow-up message for this contact.",
  es: "Redacta un mensaje de seguimiento para este contacto.",
};

export const analyzeContactHealth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => HealthInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[contact-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "contact_health",
        `${data.contactId}:${data.language}`,
        data.force,
        async () => {
          const markdown = await runCrmAgent({
            apiKey: key,
            system: HEALTH_SYSTEM_PROMPTS[data.language],
            prompt: HEALTH_USER_PROMPTS[data.language],
            tools: [getContactProfileTool(supabase, data.contactId)],
            maxTokens: 512,
          });
          return { markdown };
        },
      );
    } catch (err: unknown) {
      console.error("[contact-ai] health agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });

export const draftFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DraftInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[contact-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase } = context;

    try {
      const message = await runCrmAgent({
        apiKey: key,
        system: DRAFT_SYSTEM_PROMPTS[data.language],
        prompt: DRAFT_USER_PROMPTS[data.language],
        tools: [getContactProfileTool(supabase, data.contactId)],
        maxTokens: 512,
      });
      return { message };
    } catch (err: unknown) {
      console.error("[contact-ai] draft agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
