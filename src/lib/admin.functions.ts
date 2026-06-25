import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_tester: boolean;
  is_admin: boolean;
};

async function assertAdmin(supabase: any, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ users: UserRow[] } | { error: string }> => {
    try {
      await assertAdmin(context.supabase, context.userId);
    } catch (e: any) {
      return { error: e?.message ?? "Forbidden" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .order("created_at", { ascending: false })
      .limit(200);
    if (pErr) return { error: pErr.message };

    const ids = (profiles ?? []).map((p: any) => p.id);
    const { data: roles, error: rErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    if (rErr) return { error: rErr.message };

    const byUser = new Map<string, Set<string>>();
    for (const r of roles ?? []) {
      const set = byUser.get((r as any).user_id) ?? new Set<string>();
      set.add((r as any).role);
      byUser.set((r as any).user_id, set);
    }

    const users: UserRow[] = (profiles ?? []).map((p: any) => {
      const set = byUser.get(p.id) ?? new Set<string>();
      return {
        id: p.id,
        email: p.email ?? null,
        full_name: p.full_name ?? null,
        is_tester: set.has("tester"),
        is_admin: set.has("admin"),
      };
    });

    return { users };
  });

export const setTesterRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetUserId: string; enabled: boolean }) => {
    if (!/^[0-9a-fA-F-]{36}$/.test(data.targetUserId)) {
      throw new Error("Invalid targetUserId");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true } | { error: string }> => {
    try {
      await assertAdmin(context.supabase, context.userId);
    } catch (e: any) {
      return { error: e?.message ?? "Forbidden" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.enabled) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.targetUserId, role: "tester" });
      // Ignore unique-violation duplicates
      if (error && !String(error.message).includes("duplicate")) {
        return { error: error.message };
      }
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.targetUserId)
        .eq("role", "tester");
      if (error) return { error: error.message };
    }
    return { ok: true };
  });
