import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useCurrentUser } from "@/hooks/use-current-user";

/**
 * Combines subscription state with the user's app role.
 * - Admins and testers always have access (no payment required).
 * - Otherwise an active / trialing / past_due (within period) sub is required.
 */
export function useEntitlement() {
  const { user, loading: userLoading } = useCurrentUser();
  const { isActive, loading: subLoading } = useSubscription();
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }
    let cancelled = false;
    setRolesLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles((data ?? []).map((r) => r.role as string));
        setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isTester = roles.includes("tester");
  const bypass = isAdmin || isTester;
  const loading = userLoading || subLoading || rolesLoading;
  const entitled = bypass || isActive;

  return { entitled, isAdmin, isTester, bypass, loading };
}
