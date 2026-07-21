import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Creatable combobox for a contact's company. Shows the company names already
// used by the organization (see useCompanyNames) so the user can pick one, and
// lets them type a brand-new name that is created on the fly. The value is a
// plain string persisted to contacts.company_name; empty string means "no
// company".
type CompanyComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function CompanyCombobox({
  value,
  onChange,
  options,
  disabled,
  id,
  className,
}: CompanyComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const trimmed = query.trim();
  const hasExactMatch = options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const showCreate = trimmed.length > 0 && !hasExactMatch;

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full h-11 items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || t("companyCombobox.placeholder")}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t("companyCombobox.searchPlaceholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!showCreate && <CommandEmpty>{t("companyCombobox.empty")}</CommandEmpty>}
            {options.length > 0 && (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem key={opt} value={opt} onSelect={() => select(opt)}>
                    <Check className={cn("h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup>
                <CommandItem value={trimmed} onSelect={() => select(trimmed)}>
                  <Plus className="h-4 w-4" />
                  {t("companyCombobox.create", { value: trimmed })}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
