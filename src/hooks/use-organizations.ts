import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./use-current-user";

export type Organization = {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
};

export function useOrganizations() {
  const { user, profile } = useCurrentUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });
    return (data ?? []) as Organization[];
  }, []);

  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchOrgs(user.id).then(async (orgs) => {
      if (cancelled) return;
      if (orgs.length === 0) {
        const defaultName =
          profile?.full_name?.split(/\s+/)[0]
            ? `Entreprise de ${profile.full_name.split(/\s+/)[0]}`
            : "Mon entreprise";
        const { data: created } = await supabase
          .from("organizations")
          .insert({ owner_id: user.id, name: defaultName })
          .select()
          .single();
        if (!cancelled && created) setOrganizations([created as Organization]);
      } else {
        setOrganizations(orgs);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user, profile, fetchOrgs]);

  const createOrg = useCallback(
    async (name: string, address?: string): Promise<Organization | null> => {
      if (!user) return null;
      const { data } = await supabase
        .from("organizations")
        .insert({ owner_id: user.id, name, address: address ?? null })
        .select()
        .single();
      if (data) {
        setOrganizations((prev) => [...prev, data as Organization]);
        return data as Organization;
      }
      return null;
    },
    [user],
  );

  const updateOrg = useCallback(
    async (id: string, patch: { name?: string; address?: string | null; city?: string | null; postal_code?: string | null; country?: string | null }) => {
      const { data } = await supabase
        .from("organizations")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (data) {
        setOrganizations((prev) =>
          prev.map((o) => (o.id === id ? (data as Organization) : o)),
        );
      }
      return data as Organization | null;
    },
    [],
  );

  const deleteOrg = useCallback(async (id: string) => {
    await supabase.from("organizations").delete().eq("id", id);
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const refetch = useCallback(async () => {
    if (!user) return;
    const orgs = await fetchOrgs(user.id);
    setOrganizations(orgs);
  }, [user, fetchOrgs]);

  return { organizations, loading, createOrg, updateOrg, deleteOrg, refetch };
}
