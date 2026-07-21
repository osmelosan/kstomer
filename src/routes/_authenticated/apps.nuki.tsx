import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import i18n from "@/lib/i18n";
import { useNuki, type NukiLock, type NukiGrant } from "@/hooks/use-nuki";
import { GrantAccessDialog } from "@/components/GrantAccessDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyRound, Lock, Plus, RefreshCw, Loader2, BatteryWarning } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/nuki")({
  head: () =>
    pageHead({
      routeKey: "access",
      title: i18n.t("nuki.metaTitle"),
      path: "/apps/nuki",
      noindex: true,
    }),
  component: AccessPage,
});

function AccessPage() {
  const { t } = useTranslation();
  const { orgId, connected, loading, grants, listNukiLocks, grant, revoke } = useNuki();

  const [locks, setLocks] = useState<NukiLock[]>([]);
  const [locksLoading, setLocksLoading] = useState(false);
  const [locksError, setLocksError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<NukiGrant | null>(null);

  const refreshLocks = async () => {
    if (!connected) return;
    setLocksLoading(true);
    setLocksError(null);
    try {
      setLocks(await listNukiLocks());
    } catch (e) {
      setLocksError(e instanceof Error ? e.message : String(e));
    } finally {
      setLocksLoading(false);
    }
  };

  useEffect(() => {
    if (connected) refreshLocks();
    else setLocks([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, orgId]);

  const handleGrant = async (params: Parameters<typeof grant>[0]) => {
    await grant(params);
    toast.success(t("nuki.toast.granted"));
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revoke(revokeTarget.id);
      toast.success(t("nuki.toast.revoked"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setRevokeTarget(null);
    }
  };

  return (
    <AppShell title={t("nuki.title")} subtitle={t("nuki.subtitle")}>
      <title>{t("nuki.metaTitle")}</title>

      <Link
        to="/apps"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("apps.backToApps")}
      </Link>

      {!orgId ? (
        <div className="k-card p-8 text-sm text-muted-foreground">{t("nuki.selectCompany")}</div>
      ) : loading ? (
        <div className="k-card p-8 text-sm text-muted-foreground">{t("common.loading")}</div>
      ) : !connected ? (
        <div className="k-card p-8">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-muted grid place-items-center shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold">{t("nuki.notConnectedTitle")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("nuki.notConnected")}</p>
              <Link
                to="/settings"
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
              >
                {t("nuki.goToSettings")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Locks */}
          <div className="k-card p-7">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
                <Lock className="h-5 w-5 text-secondary" />
                {t("nuki.locks")}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshLocks}
                  disabled={locksLoading}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm font-semibold hover:bg-muted disabled:opacity-50"
                >
                  {locksLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {t("nuki.refresh")}
                </button>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  disabled={locks.length === 0}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {t("nuki.grantAccess")}
                </button>
              </div>
            </div>
            {locksError ? (
              <p className="text-sm text-destructive">{locksError}</p>
            ) : locks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {locksLoading ? t("common.loading") : t("nuki.noLocks")}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {locks.map((l) => (
                  <li key={l.smartlockId} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium">{l.name}</span>
                    {l.batteryCritical && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <BatteryWarning className="h-4 w-4" />
                        {t("nuki.batteryLow")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Grants */}
          <GrantsTable grants={grants} onRevoke={setRevokeTarget} />
        </div>
      )}

      <GrantAccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locks={locks}
        onSubmit={handleGrant}
      />

      <AlertDialog open={!!revokeTarget} onOpenChange={(v) => !v && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nuki.revokeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nuki.revokeConfirm", { name: revokeTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>{t("nuki.revoke")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export function GrantsTable({
  grants,
  onRevoke,
}: {
  grants: NukiGrant[];
  onRevoke: (g: NukiGrant) => void;
}) {
  const { t } = useTranslation();
  if (grants.length === 0) {
    return (
      <div className="k-card p-7">
        <h3 className="flex items-center gap-2 text-[18px] font-semibold tracking-tight mb-4">
          <KeyRound className="h-5 w-5 text-secondary" />
          {t("nuki.grants")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("nuki.noGrants")}</p>
      </div>
    );
  }
  return (
    <div className="k-card p-7">
      <h3 className="flex items-center gap-2 text-[18px] font-semibold tracking-tight mb-4">
        <KeyRound className="h-5 w-5 text-secondary" />
        {t("nuki.grants")}
      </h3>
      <ul className="divide-y divide-border">
        {grants.map((g) => (
          <li key={g.id} className="flex items-center justify-between py-3 gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{g.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {g.smartlock_name ?? g.smartlock_id} ·{" "}
                {t(g.type === "keypad" ? "nuki.dialog.typeKeypad" : "nuki.dialog.typeAppKey")}
                {g.allowed_until
                  ? ` · ${t("nuki.until")} ${new Date(g.allowed_until).toLocaleString()}`
                  : ""}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={
                  g.status === "active"
                    ? "text-xs font-semibold text-emerald-600"
                    : "text-xs font-semibold text-muted-foreground"
                }
              >
                {t(g.status === "active" ? "nuki.statusActive" : "nuki.statusRevoked")}
              </span>
              {g.status === "active" && (
                <button
                  type="button"
                  onClick={() => onRevoke(g)}
                  className="h-8 px-3 rounded-md border border-border text-xs font-semibold hover:bg-muted"
                >
                  {t("nuki.revoke")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
