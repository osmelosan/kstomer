import { Bell, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";

const RENEWAL_KEYS: Record<number, { title: string; body: string }> = {
  30: { title: "notif.items.renewalJ30.title", body: "notif.items.renewalJ30.body" },
  7: { title: "notif.items.renewalJ7.title", body: "notif.items.renewalJ7.body" },
  0: { title: "notif.items.renewalJ0.title", body: "notif.items.renewalJ0.body" },
};

function relativeTime(
  iso: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("notif.time.now");
  if (minutes < 60) return t("notif.time.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notif.time.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("notif.time.days", { count: days });
}

export function NotificationsPopover() {
  const { t } = useTranslation();
  const { notifications, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read_at).length;

  const handleClick = (id: string) => {
    markRead(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
          aria-label={t("notif.title")}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="text-sm font-semibold">{t("notif.title")}</div>
          <button onClick={() => markAllRead()} className="text-xs text-secondary hover:underline">
            {t("notif.markAllRead")}
          </button>
        </div>
        <ul className="max-h-[380px] overflow-y-auto">
          {!loading && notifications.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("notif.empty")}
            </li>
          )}
          {notifications.map((n) => {
            const keys = RENEWAL_KEYS[n.trigger_offset_days ?? -1];
            const contactName = n.contacts?.contact_name ?? "";
            const className = cn(
              "flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer",
              !n.read_at && "bg-secondary/5",
            );
            const inner = (
              <>
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted grid place-items-center text-foreground">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">
                      {keys ? t(keys.title) : t("notif.items.renewal.title")}
                    </p>
                    {!n.read_at && <span className="h-2 w-2 rounded-full bg-secondary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {keys ? t(keys.body, { contact: contactName }) : t("notif.items.renewal.body")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {relativeTime(n.created_at, t)}
                  </p>
                </div>
              </>
            );
            return (
              <li key={n.id}>
                {n.contact_id ? (
                  <Link
                    to="/contacts/$id"
                    params={{ id: n.contact_id }}
                    className={className}
                    onClick={() => handleClick(n.id)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={className} onClick={() => handleClick(n.id)}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
