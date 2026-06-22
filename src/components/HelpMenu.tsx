import { HelpCircle, BookOpen, Keyboard, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHORTCUTS = [
  { keys: "⌘ K", labelKey: "help.shortcuts.search" },
  { keys: "G then D", labelKey: "help.shortcuts.dashboard" },
  { keys: "G then C", labelKey: "help.shortcuts.contacts" },
  { keys: "G then K", labelKey: "help.shortcuts.kanban" },
  { keys: "N", labelKey: "help.shortcuts.new" },
  { keys: "?", labelKey: "help.shortcuts.help" },
];

export function HelpMenu() {
  const { t } = useTranslation();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
            aria-label={t("common.help")}
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => window.open("https://docs.lovable.dev", "_blank")}>
            <BookOpen className="h-4 w-4 mr-2" />
            {t("help.docs")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
            <Keyboard className="h-4 w-4 mr-2" />
            {t("help.shortcutsLabel")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <MessageSquare className="h-4 w-4 mr-2" />
            {t("help.contact")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sparkles className="h-4 w-4 mr-2" />
            {t("help.whatsNew")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("help.shortcutsLabel")}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 mt-2">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex items-center justify-between text-sm py-1.5">
                <span className="text-foreground">{t(s.labelKey)}</span>
                <kbd className="px-2 py-1 rounded-md bg-muted border border-border font-mono text-xs">{s.keys}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
