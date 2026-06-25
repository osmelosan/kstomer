import { Bell, MessageCircle, TrendingUp, AlertTriangle, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NotifType = "message" | "deal" | "alert" | "contact";

type NotifLink =
  | { kind: "contact"; id: string }
  | { kind: "task"; id: string };

type Notif = {
  id: string;
  type: NotifType;
  titleKey: string;
  bodyKey: string;
  time: string;
  read: boolean;
  link: NotifLink;
};

const ICONS: Record<NotifType, typeof Bell> = {
  message: MessageCircle,
  deal: TrendingUp,
  alert: AlertTriangle,
  contact: UserPlus,
};

const SEED: Notif[] = [
  { id: "1", type: "deal", titleKey: "notif.items.dealWon.title", bodyKey: "notif.items.dealWon.body", time: "5m", read: false, link: { kind: "contact", id: "marie-lefebvre" } },
  { id: "2", type: "message", titleKey: "notif.items.newMessage.title", bodyKey: "notif.items.newMessage.body", time: "1h", read: false, link: { kind: "contact", id: "marie-lefebvre" } },
  { id: "3", type: "alert", titleKey: "notif.items.overdue.title", bodyKey: "notif.items.overdue.body", time: "3h", read: false, link: { kind: "task", id: "t3" } },
  { id: "4", type: "contact", titleKey: "notif.items.newContact.title", bodyKey: "notif.items.newContact.body", time: "1d", read: true, link: { kind: "contact", id: "pierre-durand" } },
  { id: "5", type: "deal", titleKey: "notif.items.renewal.title", bodyKey: "notif.items.renewal.body", time: "2d", read: true, link: { kind: "contact", id: "jean-dupont" } },
];

export function NotificationsPopover() {
  const { t } = useTranslation();
  const [items, setItems] = useState(SEED);
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => !i.read).length;

  const handleClick = (id: string) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, read: true } : i)));
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
          <button
            onClick={() => setItems((arr) => arr.map((i) => ({ ...i, read: true })))}
            className="text-xs text-secondary hover:underline"
          >
            {t("notif.markAllRead")}
          </button>
        </div>
        <ul className="max-h-[380px] overflow-y-auto">
          {items.map((n) => {
            const Icon = ICONS[n.type];
            const className = cn(
              "flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer",
              !n.read && "bg-secondary/5",
            );
            const inner = (
              <>
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted grid place-items-center text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{t(n.titleKey)}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-secondary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t(n.bodyKey)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </>
            );
            return (
              <li key={n.id}>
                {n.link.kind === "contact" ? (
                  <Link
                    to="/contacts/$id"
                    params={{ id: n.link.id }}
                    className={className}
                    onClick={() => handleClick(n.id)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <Link
                    to="/tasks"
                    search={{ focus: n.link.id }}
                    className={className}
                    onClick={() => handleClick(n.id)}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-4 py-2 border-t border-border text-center">
          <button className="text-xs text-secondary hover:underline font-medium">{t("notif.seeAll")}</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
