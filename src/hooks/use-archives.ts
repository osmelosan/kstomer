import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/lib/company-context";
import { useCurrentUser } from "./use-current-user";

export type ArchivedItem = {
  id: string;
  type: "contact" | "partner";
  name: string;
  subtitle: string | null;
  archived_at: string;
};

export function useArchives() {
  const { user } = useCurrentUser();
  const { current } = useCompany();
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (organizationId: string | null) => {
    let contactsQuery = supabase
      .from("contacts")
      .select("id, contact_name, company_name, archived_at")
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });
    if (organizationId) contactsQuery = contactsQuery.eq("organization_id", organizationId);

    let resellersQuery = supabase
      .from("resellers")
      .select("id, name, company, archived_at")
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });
    if (organizationId) resellersQuery = resellersQuery.eq("organization_id", organizationId);

    const [{ data: contactRows }, { data: resellerRows }] = await Promise.all([
      contactsQuery,
      resellersQuery,
    ]);

    const contactItems: ArchivedItem[] = (contactRows ?? []).map((c) => ({
      id: c.id,
      type: "contact",
      name: c.contact_name,
      subtitle: c.company_name,
      archived_at: c.archived_at as string,
    }));
    const resellerItems: ArchivedItem[] = (resellerRows ?? []).map((r) => ({
      id: r.id,
      type: "partner",
      name: r.name,
      subtitle: r.company,
      archived_at: r.archived_at as string,
    }));

    return [...contactItems, ...resellerItems].sort((a, b) =>
      b.archived_at.localeCompare(a.archived_at),
    );
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    load(current.id === "all" ? null : current.id).then((rows) => {
      if (!cancelled) {
        setItems(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, current.id, load]);

  const restore = useCallback(async (item: ArchivedItem) => {
    const table = item.type === "contact" ? "contacts" : "resellers";
    await supabase.from(table).update({ archived_at: null }).eq("id", item.id);
    setItems((prev) => prev.filter((i) => !(i.id === item.id && i.type === item.type)));
  }, []);

  return { items, loading, restore };
}
