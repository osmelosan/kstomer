import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  KanbanSquare,
  Contact2,
  Store,
  Archive,
  BarChart3,
  UserCircle,
  Bell,
  HelpCircle,
  Search,
  LogOut,
  ChevronDown,
  Building2,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; key: string; icon: typeof LayoutGrid };

const NAV: NavItem[] = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutGrid },
  { to: "/kanban", key: "nav.kanban", icon: KanbanSquare },
  { to: "/contacts", key: "nav.contacts", icon: Contact2 },
  { to: "/resellers", key: "nav.resellers", icon: Store },
  { to: "/archives", key: "nav.archives", icon: Archive },
  { to: "/analytics", key: "nav.analytics", icon: BarChart3 },
];

const COMPANIES = [
  { id: "kstomer", name: "Kstomer" },
  { id: "acme", name: "Acme Studio" },
  { id: "northwind", name: "Northwind Co." },
];

export function AppShell({
  children,
  title,
  subtitle,
  search,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  search?: { placeholder?: string; value?: string; onChange?: (v: string) => void };
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
        <div
          className="flex shrink-0 px-3"
          style={{ height: "96px", minHeight: "96px", maxHeight: "96px", alignItems: "flex-start", paddingTop: "0px" }}
        >
          <Link to="/dashboard" className="block w-full">
            <Logo
              variant="horizontal"
              theme="on-dark"
              priority
              className="w-full max-w-[216px]"
            />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, key, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors",
                  active
                    ? "bg-[color:var(--color-sidebar-active)] text-white font-semibold shadow-sm"
                    : "text-sidebar-muted hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1 border-t border-sidebar-border pt-4 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] text-sidebar-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold">
                  TM
                </div>
                <span className="flex-1 text-left text-white">Thomas Melo</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>Thomas Melo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>{t("common.settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/85 backdrop-blur px-8 h-16">
          <CompanySwitcher />

          {search && (
            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {search.onChange ? (
                  <input
                    className="w-full h-10 pl-9 pr-3 rounded-md bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-input focus:ring-2 focus:ring-ring/40"
                    placeholder={search.placeholder ?? t("common.search")}
                    value={search.value ?? ""}
                    onChange={(e) => search.onChange?.(e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full h-10 pl-9 pr-3 rounded-md bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-input focus:ring-2 focus:ring-ring/40"
                    placeholder={search.placeholder ?? t("common.search")}
                  />
                )}
              </div>
            </div>
          )}

          <div className={cn("flex items-center gap-2", !search && "ml-auto")}>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground" aria-label={t("common.help")}>
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground" aria-label={t("common.help")}>
              <HelpCircle className="h-[18px] w-[18px]" />
            </button>
            {actions}
          </div>
        </header>

        <main className="flex-1 px-8 py-8">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-[36px] leading-[44px] font-bold tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-muted-foreground text-[16px]">{subtitle}</p>
              )}
            </div>
          )}
          <div className="max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function CompanySwitcher() {
  const { t } = useTranslation();
  const ALL = { id: "all", name: t("appshell.allCompanies") };
  const [current, setCurrent] = useState<{ id: string; name: string }>(COMPANIES[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 h-9 text-sm font-medium hover:bg-muted transition-colors">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{current.id === "all" ? t("appshell.allCompanies") : current.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("appshell.companies")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setCurrent(ALL)}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-secondary" />
            {t("appshell.all")}
          </span>
          {current.id === "all" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {COMPANIES.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => setCurrent(c)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {c.name}
            </span>
            {c.id === current.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
