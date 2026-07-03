import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

type Supa = SupabaseClient<Database>;

const REFRESH_HOUR_UTC = 4;

function lastRefreshBoundary(now: Date): Date {
  const boundary = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), REFRESH_HOUR_UTC, 0, 0),
  );
  if (now.getTime() < boundary.getTime()) {
    boundary.setUTCDate(boundary.getUTCDate() - 1);
  }
  return boundary;
}

export async function getCachedOrGenerate<T>(
  supabase: Supa,
  userId: string,
  feature: string,
  scopeId: string,
  force: boolean,
  generate: () => Promise<T>,
): Promise<T> {
  if (!force) {
    const { data: cached } = await supabase
      .from("ai_insight_cache")
      .select("content, generated_at")
      .eq("user_id", userId)
      .eq("feature", feature)
      .eq("scope_id", scopeId)
      .maybeSingle();
    if (
      cached &&
      new Date(cached.generated_at).getTime() >= lastRefreshBoundary(new Date()).getTime()
    ) {
      return cached.content as T;
    }
  }

  const fresh = await generate();

  await supabase.from("ai_insight_cache").upsert(
    {
      user_id: userId,
      feature,
      scope_id: scopeId,
      content: fresh as unknown as Json,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,feature,scope_id" },
  );

  return fresh;
}
