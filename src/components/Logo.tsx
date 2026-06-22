import logoAsset from "@/assets/kstomer-logo-transparent.png.asset.json";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  eager?: boolean;
};

/**
 * Kstomer logo (white, transparent background).
 * Designed for dark surfaces. On light surfaces, place inside a dark container.
 */
export function Logo({ className, eager = false }: LogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Kstomer Smart CRM"
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      className={cn("object-contain object-left", className)}
    />
  );
}
