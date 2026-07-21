import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useCurrentUser } from "./use-current-user";

// Returns the distinct, alphabetically sorted `company_name` values already
// used by the current organization's contacts. Feeds the CompanyCombobox so
// users can pick an existing company instead of retyping (and creating typos
// of) the same name. `company_name` stays free-text — this is derived, not a
// separate companies table.
export function useCompanyNames() {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const [companyNames, setCompanyNames] = useState<string[]>([]);

  const fetchNames = useCallback(async (organizationId: string | null) => {
    let query = supabase.from("contacts").select("company_name").is("archived_at", null);
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data } = await query;
    const names = new Set<string>();
    for (const row of data ?? []) {
      const name = (row as { company_name: string | null }).company_name?.trim();
      if (name) names.add(name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, []);

  useEffect(() => {
    if (!user) {
      setCompanyNames([]);
      return;
    }
    let cancelled = false;
    const organizationId = current.id === "all" ? null : current.id;
    fetchNames(organizationId).then((names) => {
      if (!cancelled) setCompanyNames(names);
    });
    return () => {
      cancelled = true;
    };
  }, [user, current.id, fetchNames]);

  return { companyNames };
}
