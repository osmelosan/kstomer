import horizontalOnDark from "@/assets/kstomer-horizontal-on-dark.png.asset.json";
import horizontalOnLight from "@/assets/kstomer-horizontal-on-light.png.asset.json";
import isotipo from "@/assets/kstomer-isotipo.svg.asset.json";
import { cn } from "@/lib/utils";

type LogoVariant = "horizontal" | "icon";
type LogoTheme = "on-dark" | "on-light";

const SOURCES: Record<LogoVariant, Record<LogoTheme, string>> = {
  horizontal: {
    "on-dark": horizontalOnDark.url,
    "on-light": horizontalOnLight.url,
  },
  icon: {
    "on-dark": isotipo.url,
    "on-light": isotipo.url,
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
