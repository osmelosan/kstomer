import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NukiLock } from "@/hooks/use-nuki";

export type BulkContact = { id: string; name: string; email: string };

type BulkParams = {
  smartlockId: number;
  smartlockName?: string | null;
  recipients: { contactId: string; name: string; email: string }[];
  allowedUntil?: string | null;
};

type BulkResults = {
  created: number;
  results: { name: string; email: string; ok: boolean; error?: string }[];
};

// Bulk "grant app-key access" to many CRM contacts on a single lock.
export function BulkGrantAccessDialog({
  open,
  onOpenChange,
  locks,
  contacts,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  locks: NukiLock[];
  contacts: BulkContact[];
  onSubmit: (params: BulkParams) => Promise<BulkResults>;
}) {
  const { t } = useTranslation();
  const [smartlockId, setSmartlockId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [allowedUntil, setAllowedUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResults | null>(null);

  useEffect(() => {
    if (open) {
      setSmartlockId(locks.length === 1 ? String(locks[0].smartlockId) : "");
      setSelected(new Set());
      setSearch("");
      setAllowedUntil("");
      setError(null);
      setResults(null);
    }
  }, [open, locks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((c) => next.delete(c.id));
      else filtered.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const submit = async () => {
    setError(null);
    const lock = locks.find((l) => String(l.smartlockId) === smartlockId);
    if (!lock) {
      setError(t("nuki.dialog.errorLock"));
      return;
    }
    const recipients = contacts
      .filter((c) => selected.has(c.id))
      .map((c) => ({ contactId: c.id, name: c.name, email: c.email }));
    if (recipients.length === 0) {
      setError(t("nuki.bulk.errorNoContacts"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await onSubmit({
        smartlockId: lock.smartlockId,
        smartlockName: lock.name,
        recipients,
        allowedUntil: allowedUntil ? new Date(allowedUntil).toISOString() : null,
      });
      setResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const failures = results?.results.filter((r) => !r.ok) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("nuki.bulk.title")}</DialogTitle>
          <DialogDescription>{t("nuki.bulk.subtitle")}</DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              {t("nuki.bulk.createdCount", { count: results.created })}
            </div>
            {failures.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {t("nuki.bulk.failedCount", { count: failures.length })}
                </div>
                <ul className="max-h-40 overflow-auto text-xs text-muted-foreground divide-y divide-border">
                  {failures.map((f) => (
                    <li key={f.email} className="py-1.5">
                      <span className="font-medium text-foreground">{f.name}</span> — {f.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">{t("nuki.bulk.contacts")}</label>
                <span className="text-xs text-muted-foreground">
                  {t("nuki.bulk.selectedCount", { count: selected.size })}
                </span>
              </div>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("nuki.bulk.noContacts")}</p>
              ) : (
                <>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("nuki.bulk.searchContacts")}
                    className="mb-2"
                  />
                  <div className="max-h-56 overflow-auto rounded-md border border-border divide-y divide-border">
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted/50 cursor-pointer">
                      <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAll} />
                      <span className="text-xs font-semibold">{t("nuki.bulk.selectAll")}</span>
                    </label>
                    {filtered.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selected.has(c.id)}
                          onCheckedChange={() => toggle(c.id)}
                        />
                        <span className="min-w-0">
                          <span className="text-sm truncate block">{c.name}</span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {c.email}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">{t("nuki.dialog.until")}</label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={allowedUntil}
                onChange={(e) => setAllowedUntil(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {results ? (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90"
            >
              {t("nuki.bulk.done")}
            </button>
          ) : (
            <>
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
                disabled={submitting || selected.size === 0}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("nuki.bulk.submit", { count: selected.size })}
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
