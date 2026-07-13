import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getCachedOrGenerate } from "@/lib/ai-insight-cache.server";
import { generateProspects, type Prospect } from "@/lib/prospects-ai.server";

const InputSchema = z.object({
  language: z.enum(["fr", "en", "es"]).default("fr"),
  companyId: z.string(),
  force: z.boolean().default(false),
});

export type { Prospect };

export const analyzeProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error("[prospects-ai] Missing ANTHROPIC_API_KEY");
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const { supabase, userId } = context;
    const { data: org } = await supabase
      .from("organizations")
      .select("name, description, city, country")
      .eq("id", data.companyId)
      .single();

    if (!org || (!org.description && !org.city)) {
      throw new Error("MISSING_PROFILE");
    }

    try {
      return await getCachedOrGenerate(
        supabase,
        userId,
        "prospects",
        `${data.companyId}:${data.language}`,
        data.force,
        () => generateProspects(key, data.language, org),
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "AI_ERROR") throw err;
      console.error("[prospects-ai] agent run failed:", err);
      if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
      if (err instanceof Anthropic.PermissionDeniedError) throw new Error("CREDITS_EXHAUSTED");
      throw new Error("AI_ERROR");
    }
  });
