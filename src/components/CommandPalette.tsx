import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutGrid,
  KanbanSquare,
  Contact2,
  Store,
  BarChart3,
  Archive,
  Settings,
  UserPlus,
  Plus,
  Search,
} from "lucide-react";

const PAGES = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutGrid },
  { to: "/kanban", labelKey: "nav.kanban", icon: KanbanSquare },
  { to: "/contacts", labelKey: "nav.contacts", icon: Contact2 },
  { to: "/resellers", labelKey: "nav.resellers", icon: Store },
  { to: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/archives", labelKey: "nav.archives", icon: Archive },
  { to: "/settings", labelKey: "common.settings", icon: Settings },
] as const;

const RECENT_CONTACTS = [
  { name: "Thomas Durand", company: "StartUp Vision" },
  { name: "Maelis B.", company: "D2C Cosmetics" },
  { name: "Jean Dupont", company: "Dupont Co." },
];

export function CommandPaletteTrigger() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full max-w-md h-10 px-3 rounded-md bg-muted border border-transparent text-sm text-muted-foreground hover:border-input transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t("appshell.globalSearch")}</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("appshell.commandPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("appshell.noResults")}</CommandEmpty>

          <CommandGroup heading={t("appshell.pages")}>
            {PAGES.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem key={p.to} onSelect={() => go(p.to)}>
                  <Icon className="h-4 w-4 mr-2" />
                  {t(p.labelKey)}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t("appshell.recentContacts")}>
            {RECENT_CONTACTS.map((c) => (
              <CommandItem key={c.name} onSelect={() => go("/contacts")}>
                <Contact2 className="h-4 w-4 mr-2" />
                <span>{c.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{c.company}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t("appshell.actions")}>
            <CommandItem onSelect={() => go("/contacts/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("appshell.actionNewContact")}
            </CommandItem>
            <CommandItem onSelect={() => go("/kanban")}>
              <Plus className="h-4 w-4 mr-2" />
              {t("appshell.actionNewOpportunity")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
