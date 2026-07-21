import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrantAccessParams, NukiLock } from "@/hooks/use-nuki";

// Shared "grant access" form, used both from the Access panel and from a
// contact's detail page. The caller owns the actual mutation via onSubmit.
export function GrantAccessDialog({
  open,
  onOpenChange,
  locks,
  contactId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  locks: NukiLock[];
  contactId?: string | null;
  onSubmit: (params: GrantAccessParams) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [smartlockId, setSmartlockId] = useState<string>("");
  const [type, setType] = useState<"keypad" | "app_key">("keypad");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [allowedUntil, setAllowedUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSmartlockId(locks.length === 1 ? String(locks[0].smartlockId) : "");
      setType("keypad");
      setName("");
      setCode("");
      setEmail("");
      setAllowedUntil("");
      setError(null);
    }
  }, [open, locks]);

  const submit = async () => {
    setError(null);
    const lock = locks.find((l) => String(l.smartlockId) === smartlockId);
    if (!lock) {
      setError(t("nuki.dialog.errorLock"));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        smartlockId: lock.smartlockId,
        smartlockName: lock.name,
        contactId: contactId ?? null,
        type,
        name: name.trim(),
        code: type === "keypad" ? code.trim() : undefined,
        email: type === "app_key" ? email.trim() : undefined,
        allowedUntil: allowedUntil ? new Date(allowedUntil).toISOString() : null,
      });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nuki.dialog.title")}</DialogTitle>
          <DialogDescription>{t("nuki.dialog.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {locks.length !== 1 && (
            <div>
              <label className="text-sm font-medium">{t("nuki.dialog.lock")}</label>
              <Select value={smartlockId} onValueChange={setSmartlockId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("nuki.dialog.lockPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {locks.map((l) => (
                    <SelectItem key={l.smartlockId} value={String(l.smartlockId)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">{t("nuki.dialog.type")}</label>
            <Select value={type} onValueChange={(v) => setType(v as "keypad" | "app_key")}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keypad">{t("nuki.dialog.typeKeypad")}</SelectItem>
                <SelectItem value="app_key">{t("nuki.dialog.typeAppKey")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">{t("nuki.dialog.name")}</label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("nuki.dialog.namePlaceholder")}
            />
          </div>

          {type === "keypad" ? (
            <div>
              <label className="text-sm font-medium">{t("nuki.dialog.code")}</label>
              <Input
                className="mt-1"
                value={code}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("nuki.dialog.codeHint")}</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">{t("nuki.dialog.email")}</label>
              <Input
                className="mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("nuki.dialog.emailHint")}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">{t("nuki.dialog.until")}</label>
            <Input
              className="mt-1"
              type="datetime-local"
              value={allowedUntil}
              onChange={(e) => setAllowedUntil(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{t("nuki.dialog.untilHint")}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-md border border-border text-sm font-semibold hover:bg-muted"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !name.trim() || (type === "keypad" ? !code : !email)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("nuki.dialog.submit")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
