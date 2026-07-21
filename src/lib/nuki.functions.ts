import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// RPC layer for the Nuki integration. Follows payments.functions.ts: every
// function requires an authenticated Supabase session and validates its input.
// Secret-using code lives in nuki.server.ts and is pulled in via dynamic import
// so this module stays safe to ship in the client bundle.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads and decrypts the organization's Nuki token (RLS-scoped by the caller). */
async function resolveToken(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("nuki_connections")
    .select("api_token_encrypted")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.api_token_encrypted) throw new Error("Nuki is not connected for this company");
  const { decryptToken } = await import("@/lib/nuki.server");
  return decryptToken(data.api_token_encrypted as string);
}

/** Nuki wants ISO without milliseconds: YYYY-MM-DDTHH:MM:SSZ. */
function toNukiDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

type LockResult =
  | { locks: { smartlockId: number; name: string; batteryCritical: boolean }[] }
  | { error: string };

export const listLocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { organizationId: string }) => {
    if (!UUID_RE.test(data.organizationId)) throw new Error("Invalid organizationId");
    return data;
  })
  .handler(async ({ data, context }): Promise<LockResult> => {
    try {
      const token = await resolveToken(context.supabase, data.organizationId);
      const { listSmartlocks } = await import("@/lib/nuki.server");
      const locks = await listSmartlocks(token);
      return {
        locks: locks.map((l) => ({
          smartlockId: l.smartlockId,
          name: l.name,
          batteryCritical: !!l.state?.batteryCritical,
        })),
      };
    } catch (error) {
      const { getNukiErrorMessage } = await import("@/lib/nuki.server");
      return { error: getNukiErrorMessage(error) };
    }
  });

export const saveNukiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { organizationId: string; token: string }) => {
    if (!UUID_RE.test(data.organizationId)) throw new Error("Invalid organizationId");
    if (typeof data.token !== "string" || data.token.trim().length < 8) {
      throw new Error("Invalid token");
    }
    return { organizationId: data.organizationId, token: data.token.trim() };
  })
  .handler(
    async ({ data, context }): Promise<{ ok: true; tokenLast4: string } | { error: string }> => {
      try {
        const { listSmartlocks, encryptToken, getNukiErrorMessage } =
          await import("@/lib/nuki.server");
        // Validate the token against the real API before storing it.
        try {
          await listSmartlocks(data.token);
        } catch (e) {
          return { error: getNukiErrorMessage(e) };
        }
        const encrypted = await encryptToken(data.token);
        const tokenLast4 = data.token.slice(-4);
        const { error } = await context.supabase.from("nuki_connections").upsert(
          {
            organization_id: data.organizationId,
            api_token_encrypted: encrypted,
            token_last4: tokenLast4,
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "organization_id" },
        );
        if (error) return { error: error.message };
        return { ok: true, tokenLast4 };
      } catch (error) {
        const { getNukiErrorMessage } = await import("@/lib/nuki.server");
        return { error: getNukiErrorMessage(error) };
      }
    },
  );

type GrantInput = {
  organizationId: string;
  smartlockId: number;
  smartlockName?: string | null;
  contactId?: string | null;
  type: "keypad" | "app_key";
  name: string;
  code?: string;
  email?: string;
  allowedFrom?: string | null;
  allowedUntil?: string | null;
  weekDays?: number | null;
  fromTime?: number | null;
  untilTime?: number | null;
};

export const grantAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GrantInput) => {
    if (!UUID_RE.test(data.organizationId)) throw new Error("Invalid organizationId");
    if (!Number.isInteger(data.smartlockId)) throw new Error("Invalid smartlockId");
    if (data.contactId && !UUID_RE.test(data.contactId)) throw new Error("Invalid contactId");
    if (data.type !== "keypad" && data.type !== "app_key") throw new Error("Invalid type");
    if (!data.name || data.name.trim().length === 0) throw new Error("Name is required");
    if (data.type === "keypad") {
      if (!data.code || !/^[1-9]{6}$/.test(data.code) || data.code.startsWith("12")) {
        throw new Error("Keypad code must be 6 digits from 1-9 and must not start with '12'");
      }
    }
    if (data.type === "app_key" && (!data.email || !/^\S+@\S+\.\S+$/.test(data.email))) {
      throw new Error("A valid email is required for an app key");
    }
    return data;
  })
  .handler(
    async ({ data, context }): Promise<{ ok: true; grantId: string } | { error: string }> => {
      try {
        const token = await resolveToken(context.supabase, data.organizationId);
        const nuki = await import("@/lib/nuki.server");
        const restrictions = {
          allowedFromDate: toNukiDate(data.allowedFrom),
          allowedUntilDate: toNukiDate(data.allowedUntil),
          ...(data.weekDays ? { allowedWeekDays: data.weekDays } : {}),
          ...(typeof data.fromTime === "number" ? { allowedFromTime: data.fromTime } : {}),
          ...(typeof data.untilTime === "number" ? { allowedUntilTime: data.untilTime } : {}),
        };

        if (data.type === "keypad") {
          await nuki.createKeypadCode(token, data.smartlockId, {
            name: data.name,
            code: Number(data.code),
            ...restrictions,
          });
        } else {
          await nuki.createAppKey(token, data.smartlockId, {
            name: data.name,
            email: data.email!,
            ...restrictions,
          });
        }

        // Creation is async and returns no id; look it up by name for later revoke.
        let nukiAuthId: string | null = null;
        try {
          nukiAuthId = await nuki.findAuthId(token, data.smartlockId, data.name);
        } catch {
          /* non-fatal: we can still resolve by name at revoke time */
        }

        const { data: inserted, error } = await context.supabase
          .from("nuki_access_grants")
          .insert({
            organization_id: data.organizationId,
            contact_id: data.contactId ?? null,
            smartlock_id: String(data.smartlockId),
            smartlock_name: data.smartlockName ?? null,
            nuki_auth_id: nukiAuthId,
            type: data.type,
            name: data.name,
            allowed_from: data.allowedFrom ?? null,
            allowed_until: data.allowedUntil ?? null,
            status: "active",
            created_by_user_id: context.userId,
          })
          .select("id")
          .single();
        if (error) return { error: error.message };
        return { ok: true, grantId: (inserted as { id: string }).id };
      } catch (error) {
        const { getNukiErrorMessage } = await import("@/lib/nuki.server");
        return { error: getNukiErrorMessage(error) };
      }
    },
  );

export const revokeAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { grantId: string }) => {
    if (!UUID_RE.test(data.grantId)) throw new Error("Invalid grantId");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true } | { error: string }> => {
    try {
      const { data: grant, error: loadError } = await context.supabase
        .from("nuki_access_grants")
        .select("id, organization_id, smartlock_id, nuki_auth_id, name, status")
        .eq("id", data.grantId)
        .maybeSingle();
      if (loadError) return { error: loadError.message };
      if (!grant) return { error: "Access not found" };

      const g = grant as {
        organization_id: string;
        smartlock_id: string;
        nuki_auth_id: string | null;
        name: string;
      };
      const token = await resolveToken(context.supabase, g.organization_id);
      const nuki = await import("@/lib/nuki.server");
      const smartlockId = Number(g.smartlock_id);
      const authId = g.nuki_auth_id ?? (await nuki.findAuthId(token, smartlockId, g.name));
      if (authId) {
        await nuki.deleteAuth(token, smartlockId, authId);
      }
      const { error } = await context.supabase
        .from("nuki_access_grants")
        .update({ status: "revoked", nuki_auth_id: authId, updated_at: new Date().toISOString() })
        .eq("id", data.grantId);
      if (error) return { error: error.message };
      return { ok: true };
    } catch (error) {
      const { getNukiErrorMessage } = await import("@/lib/nuki.server");
      return { error: getNukiErrorMessage(error) };
    }
  });
