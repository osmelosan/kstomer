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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; icon: typeof LayoutGrid };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/kanban", label: "Kanban", icon: KanbanSquare },
  { to: "/contacts", label: "Contacts", icon: Contact2 },
  { to: "/resellers", label: "Resellers", icon: Store },
  { to: "/archives", label: "Archives", icon: Archive },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const ALL_COMPANIES = { id: "all", name: "Toutes les entreprises" };
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
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
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
                    placeholder={search.placeholder ?? "Rechercher…"}
                    value={search.value ?? ""}
                    onChange={(e) => search.onChange?.(e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full h-10 pl-9 pr-3 rounded-md bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-input focus:ring-2 focus:ring-ring/40"
                    placeholder={search.placeholder ?? "Rechercher…"}
                  />
                )}


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

function CompanySwitcher() {
  const [current, setCurrent] = useState(COMPANIES[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 h-9 text-sm font-medium hover:bg-muted transition-colors">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{current.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Entreprises</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setCurrent(ALL_COMPANIES)}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-secondary" />
            Toutes
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold ml-1">
              {"\n"}
            </span>
          </span>
          {current.id === ALL_COMPANIES.id && <Check className="h-4 w-4" />}
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
