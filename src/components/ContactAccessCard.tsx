import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { KeyRound, Plus } from "lucide-react";
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

// Compact Nuki access panel shown on a contact's detail page: grant a lock code
// to this contact and see / revoke the accesses already granted to them.
export function ContactAccessCard({ contactId }: { contactId: string }) {
  const { t } = useTranslation();
  const { connected, loading, grants, listNukiLocks, grant, revoke } = useNuki({ contactId });
  const [locks, setLocks] = useState<NukiLock[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<NukiGrant | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (connected) {
      listNukiLocks()
        .then((l) => !cancelled && setLocks(l))
        .catch(() => !cancelled && setLocks([]));
    } else {
      setLocks([]);
    }
    return () => {
      cancelled = true;
    };
  }, [connected, listNukiLocks]);

  if (loading || !connected) return null;

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
    <div className="k-card p-8">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="flex items-center gap-2 text-[20px] font-semibold">
          <KeyRound className="h-5 w-5 text-secondary" />
          {t("nuki.contactCardTitle")}
        </h3>
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

      {grants.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("nuki.contactNoGrants")}</p>
      ) : (
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
                    onClick={() => setRevokeTarget(g)}
                    className="h-8 px-3 rounded-md border border-border text-xs font-semibold hover:bg-muted"
                  >
                    {t("nuki.revoke")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <GrantAccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locks={locks}
        contactId={contactId}
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
    </div>
  );
}
