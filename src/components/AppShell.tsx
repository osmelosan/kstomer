import { Link, Navigate, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  KanbanSquare,
  Contact2,
  Store,
  Archive,
  BarChart3,
  CheckSquare,
  KeyRound,
  UserCircle,
  LogOut,
  ChevronDown,
  Building2,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { HelpMenu } from "@/components/HelpMenu";
import { CommandPaletteTrigger } from "@/components/CommandPalette";
import { MobileQuickActions } from "@/components/MobileQuickActions";
import { useCompany, ALL_COMPANIES, type Company } from "@/lib/company-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useEntitlement } from "@/hooks/use-entitlement";

type NavItem = { to: string; key: string; icon: typeof LayoutGrid };

const NAV: NavItem[] = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutGrid },
  { to: "/kanban", key: "nav.kanban", icon: KanbanSquare },
  { to: "/tasks", key: "nav.tasks", icon: CheckSquare },
  { to: "/contacts", key: "nav.contacts", icon: Contact2 },
  { to: "/resellers", key: "nav.resellers", icon: Store },
  { to: "/access", key: "nav.access", icon: KeyRound },
  { to: "/analytics", key: "nav.analytics", icon: BarChart3 },
  { to: "/archives", key: "nav.archives", icon: Archive },
];

const COLLAPSE_KEY = "kstomer.sidebar.collapsed";

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
  const { current } = useCompany();
  const { user, profile } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { entitled, loading: entLoading } = useEntitlement();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load persisted collapsed state once on mount
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(COLLAPSE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {
      /* noop */
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  }

  // Paywall: gate everything except /settings. Send users straight to pricing.
  const onSettings = pathname.startsWith("/settings");
  if (!entLoading && !entitled && !onSettings) {
    return <Navigate to="/pricing" replace />;
  }

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "—";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.info(t("common.loggedOut"));
    navigate({ to: "/auth", replace: true });
  };

  const sidebarWidth = collapsed ? "w-16" : "w-60";
  const mainMargin = collapsed ? "md:ml-16" : "md:ml-60";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground",
            "transition-[width,transform] duration-200 ease-out",
            sidebarWidth,
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          )}
        >
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="md:hidden absolute top-3 right-3 h-8 w-8 rounded-md text-sidebar-muted hover:text-white hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="flex shrink-0 px-3 items-center"
            style={{ height: "96px", minHeight: "96px", maxHeight: "96px" }}
          >
            <Link to="/dashboard" className="block w-full">
              {collapsed ? (
                <Logo
                  variant="icon"
                  theme="on-dark"
                  priority
                  className="h-8 w-8 mx-auto"
                />
              ) : (
                <Logo
                  variant="horizontal"
                  theme="on-dark"
                  priority
                  className="w-full max-w-[216px]"
                />
              )}
            </Link>
          </div>

          <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
            {NAV.map(({ to, key, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              const link = (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center rounded-md text-[14px] transition-colors",
                    collapsed
                      ? "justify-center h-10 w-12 mx-auto"
                      : "gap-3 px-3 py-2",
                    active
                      ? "bg-[color:var(--color-sidebar-active)] text-white font-semibold shadow-sm"
                      : "text-sidebar-muted hover:text-white hover:bg-white/5",
                  )}
                  aria-label={collapsed ? t(key) : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{t(key)}</span>}
                </Link>
              );
              if (!collapsed) return link;
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {t(key)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div
            className={cn(
              "pb-6 space-y-1 border-t border-sidebar-border pt-4 mt-4",
              collapsed ? "px-2" : "px-3",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center rounded-md text-[14px] text-sidebar-muted hover:text-white hover:bg-white/5 transition-colors",
                    collapsed ? "justify-center h-10" : "gap-3 px-3 py-2",
                  )}
                  aria-label={collapsed ? displayName : undefined}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold">
                    {initials || "?"}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-white truncate">
                        {displayName}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                {user?.email && (
                  <div className="px-2 pb-1 text-[11px] text-muted-foreground truncate">
                    {user.email}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span>{t("common.settings")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-[margin] duration-200",
            mainMargin,
          )}
        >
          <PaymentTestModeBanner />
          <header className="sticky top-0 z-20 flex items-center gap-2 sm:gap-4 border-b border-border bg-background/85 backdrop-blur px-4 md:px-8 h-16">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("appshell.openMenu")}
              className="md:hidden h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={t(collapsed ? "appshell.expandSidebar" : "appshell.collapseSidebar")}
              className="hidden md:flex h-9 w-9 rounded-md hover:bg-muted items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <div className="hidden md:block">
              <CompanySwitcher />
            </div>

            {search ? (
              <div className="flex-1 max-w-xl mx-auto">
                <input
                  className="w-full h-10 px-3 rounded-md bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-input focus:ring-2 focus:ring-ring/40"
                  placeholder={search.placeholder ?? t("common.search")}
                  value={search.value ?? ""}
                  onChange={(e) => search.onChange?.(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex-1 max-w-xl mx-auto hidden md:block">
                <CommandPaletteTrigger />
              </div>
            )}

            <div className={cn("flex items-center gap-1 sm:gap-2 ml-auto")}>
              <NotificationsPopover />
              <div className="hidden sm:block">
                <HelpMenu />
              </div>
              {actions}
            </div>
          </header>

          <main className="flex-1 px-4 md:px-8 py-4 md:py-8">
            {(title || subtitle) && (
              <div className="mb-6 md:mb-8">
                {title && (
                  <h1 className="text-2xl md:text-[36px] md:leading-[44px] font-bold tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-muted-foreground text-sm md:text-[16px]">
                    {subtitle}
                  </p>
                )}
                {current.id !== "all" && (
                  <p className="mt-2 text-xs text-muted-foreground">{"\n"}</p>
                )}
              </div>
            )}
            <div className="max-w-[1280px]">{children}</div>
          </main>
        </div>

        <MobileQuickActions />
      </div>
    </TooltipProvider>
  );
}

function CompanySwitcher() {
  const { t } = useTranslation();
  const { current, setCurrent, companies } = useCompany();
  const ALL = { ...ALL_COMPANIES, name: t("appshell.allCompanies") };

  const select = (c: Company) => {
    setCurrent(c);
    if (c.id === "all") {
      toast.info(t("appshell.viewingAll"));
    } else {
      toast.info(`${t("appshell.viewingData")} ${c.name}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 h-9 text-sm font-medium hover:bg-muted transition-colors">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[140px] truncate">
            {current.id === "all" ? t("appshell.allCompanies") : current.name}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("appshell.companies")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => select(ALL)}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-secondary" />
            {t("appshell.all")}
          </span>
          {current.id === "all" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {companies.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => select(c)}
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
