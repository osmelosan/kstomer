import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import i18n from "@/lib/i18n";
import { useNuki } from "@/hooks/use-nuki";
import { KeyRound, Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/")({
  head: () =>
    pageHead({
      routeKey: "apps",
      title: i18n.t("apps.metaTitle"),
      path: "/apps",
      noindex: true,
    }),
  component: AppsPage,
});

function AppsPage() {
  const { t } = useTranslation();
  const { connected } = useNuki();

  return (
    <AppShell title={t("apps.title")} subtitle={t("apps.subtitle")}>
      <title>{t("apps.metaTitle")}</title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <Link
          to="/apps/nuki"
          className="k-card p-6 flex items-start gap-4 hover:border-secondary/50 transition-colors group"
        >
          <div className="h-11 w-11 rounded-md bg-muted grid place-items-center shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold">{t("apps.nukiName")}</h3>
              {connected && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  {t("settings.integrations.connected")}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t("apps.nukiDesc")}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary">
              {t("apps.open")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <div className="k-card p-6 flex items-center justify-center border-dashed">
          <p className="text-sm text-muted-foreground">{t("apps.comingSoon")}</p>
        </div>
      </div>
    </AppShell>
  );
}
