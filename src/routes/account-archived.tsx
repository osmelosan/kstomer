import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/company-context";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/account-archived")({
  ssr: false,
  head: () =>
    pageHead({
      routeKey: "settings",
      title: i18n.t("accountArchived.metaTitle"),
      path: "/account-archived",
      noindex: true,
    }),
  component: AccountArchivedPage,
});

const RETENTION_DAYS = 365;

function AccountArchivedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restoreAccount } = useCompany();
  const [checking, setChecking] = useState(true);
  const [archivedAt, setArchivedAt] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const { data: orgs } = await supabase
        .from("organizations")
        .select("archived_at")
        .eq("owner_id", userData.user.id)
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: false });
      if (cancelled) return;
      if (!orgs || orgs.length === 0) {
        // Nothing archived (already restored elsewhere, or purged) — send
        // them back into the app rather than stranding them here.
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setArchivedAt(orgs[0].archived_at);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await restoreAccount();
      if (restored.length === 0) {
        toast.error(t("accountArchived.restoreError"));
        setRestoring(false);
        return;
      }
      toast.success(t("accountArchived.restored"));
      navigate({ to: "/dashboard", replace: true });
    } catch {
      toast.error(t("accountArchived.restoreError"));
      setRestoring(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const daysRemaining = archivedAt
    ? Math.max(
        0,
        RETENTION_DAYS - Math.floor((Date.now() - new Date(archivedAt).getTime()) / (24 * 60 * 60 * 1000)),
      )
    : null;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <title>{t("accountArchived.metaTitle")}</title>
      <div className="w-full max-w-md k-card p-8 text-center space-y-5">
        <Logo className="mx-auto h-8 w-auto" />
        <h1 className="text-xl font-semibold tracking-tight">{t("accountArchived.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {daysRemaining !== null
            ? t("accountArchived.bodyWithDays", { days: daysRemaining })
            : t("accountArchived.body")}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleRestore} disabled={restoring}>
            {restoring ? t("common.loading") : t("accountArchived.restoreAction")}
          </Button>
          <Button variant="outline" onClick={handleSignOut} disabled={restoring}>
            {t("accountArchived.signOutAction")}
          </Button>
        </div>
      </div>
    </div>
  );
}
