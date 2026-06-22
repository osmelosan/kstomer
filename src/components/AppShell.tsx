import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  KanbanSquare,
  Contact2,
  Store,
  Archive,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  Search,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutGrid };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/kanban", label: "Kanban", icon: KanbanSquare },
  { to: "/contacts", label: "Contacts", icon: Contact2 },
  { to: "/resellers", label: "Resellers", icon: Store },
  { to: "/archives", label: "Archives", icon: Archive },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
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
  search?: { placeholder?: string };
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center h-16 px-4">
          <Link to="/dashboard" className="block">
            <Logo
              variant="horizontal"
              theme="on-dark"
              priority
              className="h-12 max-w-[200px]"
            />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
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
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1 border-t border-sidebar-border pt-4 mt-4">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors",
              pathname === "/settings"
                ? "bg-[color:var(--color-sidebar-active)] text-white font-semibold"
                : "text-sidebar-muted hover:text-white hover:bg-white/5",
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>Settings</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[14px] text-sidebar-muted hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Log out</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/85 backdrop-blur px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              JS
            </div>
            <span className="text-sm font-medium">Julien S.</span>
          </div>

          {search && (
            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-input focus:ring-2 focus:ring-ring/40"
                  placeholder={search.placeholder ?? "Rechercher…"}
                />
              </div>
            </div>
          )}

          <div className={cn("flex items-center gap-2", !search && "ml-auto")}>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground">
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
