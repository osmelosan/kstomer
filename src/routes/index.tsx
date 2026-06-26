import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { pageHead } from "@/lib/route-seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      routeKey: "home",
      title: i18n.t("welcome.metaTitle"),
      path: "/",
    }),
  component: WelcomePage,
});


function WelcomePage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] px-10 py-14 text-center">
        <Logo
          variant="horizontal"
          theme="on-light"
          priority
          className="h-36 md:h-44 mx-auto mb-10"
        />

        <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight whitespace-pre-line">
          {t("welcome.heading")}
        </h1>

        <p className="mt-6 text-muted-foreground text-[16px] leading-7">{t("welcome.intro")}</p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["A", "B", "C"].map((c, i) => (
              <div
                key={c}
                className="h-9 w-9 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-semibold"
                style={{
                  backgroundImage: `linear-gradient(135deg, hsl(${
                    220 + i * 12
                  } 60% 70%), hsl(${230 + i * 8} 70% 45%))`,
                  color: "white",
                }}
              >
                {c}
              </div>
            ))}
            <div className="h-9 px-2 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center border-2 border-card">
              +1k
            </div>
          </div>
        </div>

        <p className="mt-5 italic text-sm text-muted-foreground">{t("welcome.testimonial")}</p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-[12px] font-semibold tracking-wider text-secondary">
          <BadgeCheck className="h-4 w-4" />
          {t("welcome.chosenBy")}
        </div>

        <Link
          to="/auth"
          className="mt-10 flex items-center justify-center gap-3 w-full h-14 rounded-lg bg-primary text-primary-foreground text-[16px] font-semibold hover:bg-primary/90 transition-colors"
        >
          {t("welcome.cta")}
          <ArrowRight className="h-5 w-5" />
        </Link>

        <Link
          to="/pricing"
          className="mt-3 inline-block text-sm text-secondary hover:underline font-medium"
        >
          {t("welcome.seePricing")}
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">{t("welcome.fastSetup")}</p>
      </div>
    </main>
  );
}
