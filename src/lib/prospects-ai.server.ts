import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5";
const MAX_STEPS = 3;

export type Prospect = {
  company: string;
  sector: string;
  fit: number;
  reason: string;
  match: string;
  contactName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
};

const RETURN_PROSPECTS_TOOL: Anthropic.Tool = {
  name: "return_prospects",
  description:
    "Return the final list of prospect suggestions. Call this exactly once, as the last step.",
  input_schema: {
    type: "object",
    properties: {
      prospects: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            company: { type: "string", description: "Name of the prospect business" },
            sector: {
              type: "string",
              description:
                "Short sector/size descriptor, e.g. '12 employees · D2C cosmetics brand'",
            },
            fit: { type: "integer", description: "Fit score from 0 to 100" },
            reason: {
              type: "string",
              description:
                "One short sentence on why this business is a good fit, grounded in what you found",
            },
            match: {
              type: "string",
              description: "Short label for the matching service/offering, e.g. 'Website redesign'",
            },
          },
          required: ["company", "sector", "fit", "reason", "match"],
        },
      },
    },
    required: ["prospects"],
  },
};

const SYSTEM_PROMPTS = {
  fr: "Tu es un expert en prospection commerciale locale. Utilise la recherche web pour trouver de vraies entreprises proches de la localisation donnée qui pourraient être intéressées par l'activité décrite. Puis appelle l'outil return_prospects avec 3 suggestions maximum, classées par pertinence. N'invente pas de coordonnées de contact (email, téléphone). Réponds uniquement via l'appel d'outil, sans texte libre.",
  en: "You are a local business-prospecting expert. Use web search to find real businesses near the given location that could be interested in the described business activity. Then call the return_prospects tool with up to 3 suggestions, ranked by relevance. Do not invent contact details (email, phone). Respond only via the tool call, with no free text.",
  es: "Eres un experto en prospección comercial local. Usa la búsqueda web para encontrar negocios reales cerca de la ubicación dada que podrían estar interesados en la actividad descrita. Luego llama a la herramienta return_prospects con hasta 3 sugerencias, ordenadas por relevancia. No inventes datos de contacto (email, teléfono). Responde únicamente mediante la llamada a la herramienta, sin texto libre.",
};

export type OrgProfile = {
  name: string;
  description: string | null;
  city: string | null;
  country: string | null;
};

function buildUserPrompt(language: "fr" | "en" | "es", profile: OrgProfile): string {
  const location = [profile.city, profile.country].filter(Boolean).join(", ") || "unknown location";
  const prompts = {
    fr: `Entreprise : ${profile.name}\nLocalisation : ${location}\nDescription de l'activité : ${profile.description}\n\nTrouve des prospects proches pertinents.`,
    en: `Business: ${profile.name}\nLocation: ${location}\nBusiness description: ${profile.description}\n\nFind relevant nearby prospects.`,
    es: `Negocio: ${profile.name}\nUbicación: ${location}\nDescripción del negocio: ${profile.description}\n\nEncuentra prospectos cercanos relevantes.`,
  };
  return prompts[language];
}

export async function generateProspects(
  apiKey: string,
  language: "fr" | "en" | "es",
  profile: OrgProfile,
): Promise<{ prospects: Prospect[] }> {
  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(language, profile) },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPTS[language],
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [{ type: "web_search_20250305", name: "web_search" }, RETURN_PROSPECTS_TOOL],
      messages,
    });

    if (response.stop_reason === "refusal") {
      throw new Error("AI_ERROR");
    }

    const returnCall = response.content.find(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" && block.name === "return_prospects",
    );
    if (returnCall) {
      const parsed = returnCall.input as { prospects: Prospect[] };
      return { prospects: parsed.prospects.slice(0, 5) };
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: "Call return_prospects now with your best current findings.",
    });
  }

  throw new Error("AI_ERROR");
}
