import { cn } from "@/lib/utils";

type LogoVariant = "horizontal" | "icon";
type LogoTheme = "on-dark" | "on-light";

const SOURCES: Record<LogoVariant, Record<LogoTheme, string>> = {
  horizontal: {
    "on-dark": "/kstomer-horizontal-on-dark.png",
    "on-light": "/kstomer-horizontal-on-light.png",
  },
  icon: {
    "on-dark": "/kstomer-isotipo.png",
    "on-light": "/kstomer-isotipo.png",
  },
};

export function Logo({
  variant = "horizontal",
  theme = "on-light",
  className,
  priority = false,
}: {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={SOURCES[variant][theme]}
      alt="Kstomer Smart CRM"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("w-auto object-contain select-none", className)}
      draggable={false}
    />
  );
}
