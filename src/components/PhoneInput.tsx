import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import {
  PHONE_COUNTRIES,
  combinePhoneValue,
  findCountry,
  flagEmoji,
  parsePhoneValue,
  validatePhoneNumber,
} from "@/lib/phone-countries";

// Combines a country-prefix dropdown (flag + dial code, searchable) with a
// plain text input for the rest of the number. The full value passed in and
// emitted via onChange is a single string ("+<dialCode> <number>"), so it
// still fits the existing free-text `phone` column with no schema change.
type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
};

export function PhoneInput({ value, onChange, className, id }: PhoneInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { iso2: parsedIso2, number } = parsePhoneValue(value);
  // combinePhoneValue collapses to "" while the number is still empty (so
  // picking a country doesn't save a bare "+33" with no digits), which would
  // otherwise make a country choice invisible until a number is typed. Keep
  // it locally until a number gives the parsed value somewhere to live.
  const [pendingIso2, setPendingIso2] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (number) setPendingIso2(null);
  }, [value, number]);
  const iso2 = pendingIso2 ?? parsedIso2;
  const country = findCountry(iso2);
  const invalid = !validatePhoneNumber(iso2, number);

  function selectCountry(nextIso2: string) {
    setPendingIso2(nextIso2);
    onChange(combinePhoneValue(nextIso2, number));
    setOpen(false);
    setQuery("");
  }

  function changeNumber(nextNumber: string) {
    onChange(combinePhoneValue(iso2, nextNumber));
  }

  return (
    <div>
      <div className="flex">
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
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-l-md rounded-r-none border border-r-0 border-input bg-card px-2.5 text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none",
                className,
              )}
            >
              <span className="text-base leading-none">{flagEmoji(country.iso2)}</span>
              <span className="text-muted-foreground">+{country.dialCode}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput
                placeholder={t("phoneInput.searchPlaceholder")}
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>{t("phoneInput.empty")}</CommandEmpty>
                <CommandGroup>
                  {PHONE_COUNTRIES.map((c) => (
                    <CommandItem
                      key={c.iso2}
                      value={`${c.name} +${c.dialCode} ${c.dialCode}`}
                      onSelect={() => selectCountry(c.iso2)}
                    >
                      <Check className={cn("h-4 w-4", iso2 === c.iso2 ? "opacity-100" : "opacity-0")} />
                      <span className="text-base leading-none">{flagEmoji(c.iso2)}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-muted-foreground">+{c.dialCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input
          type="tel"
          id={id ? `${id}-number` : undefined}
          value={number}
          onChange={(e) => changeNumber(e.target.value)}
          aria-invalid={invalid}
          className={cn(
            "w-full min-w-0 rounded-r-md rounded-l-none border px-3 text-sm bg-card focus:ring-2 focus:ring-ring/40 focus:outline-none",
            invalid ? "border-destructive" : "border-input",
            className,
          )}
        />
      </div>
      {invalid && (
        <p className="mt-1.5 text-xs text-destructive">
          {t("phoneInput.invalid", { country: country.name })}
        </p>
      )}
    </div>
  );
}
