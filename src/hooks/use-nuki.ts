import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useCurrentUser } from "./use-current-user";
import { listLocks, saveNukiToken, grantAccess, revokeAccess } from "@/lib/nuki.functions";

export type NukiLock = { smartlockId: number; name: string; batteryCritical: boolean };

export type NukiGrant = {
  id: string;
  organization_id: string;
  contact_id: string | null;
  smartlock_id: string;
  smartlock_name: string | null;
  nuki_auth_id: string | null;
  type: "keypad" | "app_key";
  name: string;
  allowed_from: string | null;
  allowed_until: string | null;
  status: "active" | "revoked";
  created_at: string;
};

export type GrantAccessParams = {
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

/**
 * Nuki smart lock integration state for the current organization. Connection
 * status and granted accesses are read directly through the RLS-scoped client
 * (and kept live via realtime, like useContacts); everything that needs the
 * decrypted API token goes through the server functions in nuki.functions.ts.
 *
 * Pass `contactId` to scope the grants list to a single contact.
 */
export function useNuki(options?: { contactId?: string }) {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const orgId = current.id === "all" ? null : current.id;
  const contactId = options?.contactId;

  const [connected, setConnected] = useState(false);
  const [tokenLast4, setTokenLast4] = useState<string | null>(null);
  const [grants, setGrants] = useState<NukiGrant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnection = useCallback(async (organizationId: string) => {
    const { data } = await supabase
      .from("nuki_connections")
      .select("id, token_last4")
      .eq("organization_id", organizationId)
      .maybeSingle();
    return (data as { token_last4: string | null } | null) ?? null;
  }, []);

  const fetchGrants = useCallback(
    async (organizationId: string) => {
      let query = supabase
        .from("nuki_access_grants")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (contactId) query = query.eq("contact_id", contactId);
      const { data } = await query;
      return (data ?? []) as unknown as NukiGrant[];
    },
    [contactId],
  );

  useEffect(() => {
    if (!user || !orgId) {
      setConnected(false);
      setTokenLast4(null);
      setGrants([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchConnection(orgId), fetchGrants(orgId)]).then(([conn, rows]) => {
      if (cancelled) return;
      setConnected(!!conn);
      setTokenLast4(conn?.token_last4 ?? null);
      setGrants(rows);
      setLoading(false);
    });

    const channel = supabase
      .channel(`nuki-grants-${orgId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nuki_access_grants",
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchGrants(orgId).then((rows) => {
            if (!cancelled) setGrants(rows);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, orgId, fetchConnection, fetchGrants]);

  const connect = useCallback(
    async (token: string) => {
      if (!orgId) throw new Error("Select a company first");
      const res = await saveNukiToken({ data: { organizationId: orgId, token } });
      if ("error" in res) throw new Error(res.error);
      setConnected(true);
      setTokenLast4(res.tokenLast4);
      return res;
    },
    [orgId],
  );

  const disconnect = useCallback(async () => {
    if (!orgId) return;
    await supabase.from("nuki_connections").delete().eq("organization_id", orgId);
    setConnected(false);
    setTokenLast4(null);
  }, [orgId]);

  const listNukiLocks = useCallback(async (): Promise<NukiLock[]> => {
    if (!orgId) throw new Error("Select a company first");
    const res = await listLocks({ data: { organizationId: orgId } });
    if ("error" in res) throw new Error(res.error);
    return res.locks;
  }, [orgId]);

  const grant = useCallback(
    async (params: GrantAccessParams) => {
      if (!orgId) throw new Error("Select a company first");
      const res = await grantAccess({ data: { organizationId: orgId, ...params } });
      if ("error" in res) throw new Error(res.error);
      if (orgId) fetchGrants(orgId).then(setGrants);
      return res;
    },
    [orgId, fetchGrants],
  );

  const revoke = useCallback(
    async (grantId: string) => {
      const res = await revokeAccess({ data: { grantId } });
      if ("error" in res) throw new Error(res.error);
      if (orgId) fetchGrants(orgId).then(setGrants);
      return res;
    },
    [orgId, fetchGrants],
  );

  return {
    orgId,
    connected,
    tokenLast4,
    grants,
    loading,
    connect,
    disconnect,
    listNukiLocks,
    grant,
    revoke,
  };
}
