import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data as Profile | null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { user, profile, loading };
}

export function useIsTester() {
  const { user } = useCurrentUser();
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsTester(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        const roles = (data ?? []).map((r) => r.role);
        setIsTester(roles.includes("tester") || roles.includes("admin"));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return isTester;
}

export function applyLimit(value: number, isTester: boolean): number {
  return isTester ? Number.POSITIVE_INFINITY : value;
}
