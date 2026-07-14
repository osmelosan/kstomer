import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    if (location.pathname !== "/onboarding") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile && !profile.onboarding_completed) {
        throw redirect({ to: "/onboarding" });
      }
    }

    if (location.pathname !== "/account-archived") {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("archived_at")
        .eq("owner_id", data.user.id);
      const hasActiveOrg = (orgs ?? []).some((o) => !o.archived_at);
      const hasArchivedOrg = (orgs ?? []).some((o) => o.archived_at);
      // A brand-new user has zero orgs at all (useOrganizations creates the
      // default one) — only redirect when every org the user owns is
      // archived, i.e. their account is in the GDPR retention window.
      if (!hasActiveOrg && hasArchivedOrg) {
        throw redirect({ to: "/account-archived" });
      }
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
