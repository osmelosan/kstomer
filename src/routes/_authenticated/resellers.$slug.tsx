import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { pageHead } from "@/lib/route-seo";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { getResellerBySlug, type ResellerDeal } from "@/lib/mock-resellers";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Briefcase,
  Calendar,
  TrendingUp,
  Store,
  Award,
  Activity,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/_authenticated/resellers/$slug")({
  head: ({ params }) => {
    const reseller = getResellerBySlug(params.slug);
    return pageHead({
      routeKey: "resellers",
      title: reseller ? `${reseller.name} — ${i18n.t("resellers.title")}` : i18n.t("resellers.title"),
      path: `/resellers/${params.slug}`,
      noindex: true,
    });
  },
  loader: ({ params }) => {
    const reseller = getResellerBySlug(params.slug);
    if (!reseller) throw notFound();
    return { reseller };
  },
  component: ResellerDetail,
  notFoundComponent: () => (
    <AppShell title="—">
      <div className="k-card p-6 text-sm text-muted-foreground">{i18n.t("resellers.detail.notFound")}</div>
    </AppShell>
  ),
});

function ResellerDetail() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { reseller } = Route.useLoaderData();

  const locale = i18nInstance.language?.startsWith("es") ? "es-ES" : i18nInstance.language?.startsWith("en") ? "en-US" : "fr-FR";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  return (
    <AppShell title={reseller.name} subtitle={reseller.contactName}>
      <div className="mb-4">
        <Link
          to="/resellers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("resellers.detail.back")}
        </Link>
      </div>

      {/* KPIs */}
      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Kpi label={t("resellers.detail.activeDeals")} value={String(reseller.deals)} icon={<Briefcase className="h-4 w-4" />} info={t("resellers.detail.info.activeDeals")} />
          <Kpi label={t("resellers.detail.totalRevenue")} value={reseller.revenue} icon={<TrendingUp className="h-4 w-4" />} info={t("resellers.detail.info.revenue")} />
          <Kpi label={t("resellers.detail.tier")} value={reseller.tier} icon={<Award className="h-4 w-4" />} info={t("resellers.detail.info.tier")} />
          <Kpi
            label={t("resellers.detail.health")}
            value={
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-5 rounded-full"
                    style={{
                      background:
                        i <= reseller.health
                          ? "var(--color-secondary)"
                          : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                    }}
                  />
                ))}
              </div>
            }
            icon={<Activity className="h-4 w-4" />}
            info={t("resellers.detail.info.health")}
          />
        </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact column */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="k-card p-6">
            <h2 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
              <Store className="h-4 w-4 text-secondary" />
              {t("resellers.detail.contact")}
            </h2>
            <dl className="space-y-3 text-sm">
              <Field icon={<User className="h-3.5 w-3.5" />} label={t("resellers.detail.contactPerson")} value={reseller.contactName} />
              <Field icon={<Briefcase className="h-3.5 w-3.5" />} label={t("resellers.detail.role")} value={reseller.role} />
              <Field
                icon={<Mail className="h-3.5 w-3.5" />}
                label={t("resellers.detail.email")}
                value={
                  <a href={`mailto:${reseller.email}`} className="text-secondary hover:underline">
                    {reseller.email}
                  </a>
                }
              />
              <Field
                icon={<Phone className="h-3.5 w-3.5" />}
                label={t("resellers.detail.phone")}
                value={
                  <a href={`tel:${reseller.phone.replace(/\s/g, "")}`} className="text-secondary hover:underline">
                    {reseller.phone}
                  </a>
                }
              />
              <Field
                icon={<Globe className="h-3.5 w-3.5" />}
                label={t("resellers.detail.website")}
                value={
                  <a href={reseller.website} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                    {reseller.website.replace(/^https?:\/\//, "")}
                  </a>
                }
              />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label={t("resellers.detail.address")} value={reseller.address} />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label={t("resellers.detail.country")} value={reseller.country} />
              <Field icon={<Calendar className="h-3.5 w-3.5" />} label={t("resellers.detail.partnerSince")} value={formatDate(reseller.since)} />
            </dl>

            <div className="flex gap-2 mt-5">
              <a
                href={`mailto:${reseller.email}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <Mail className="h-3.5 w-3.5" />
                {t("resellers.detail.sendEmail")}
              </a>
              <a
                href={`tel:${reseller.phone.replace(/\s/g, "")}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-border hover:bg-muted/60 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {t("resellers.detail.call")}
              </a>
            </div>
          </section>

          <section className="k-card p-6">
            <h2 className="text-[15px] font-semibold tracking-tight mb-3">{t("resellers.detail.notes")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{reseller.notes}</p>
          </section>
        </aside>

        {/* Pipeline */}
        <section className="lg:col-span-2 k-card p-6">
          <h2 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-secondary" />
            {t("resellers.detail.pipeline")}
          </h2>
          {reseller.pipeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("resellers.detail.pipelineEmpty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left py-2 pr-3">{t("resellers.detail.dealName")}</th>
                    <th className="text-left py-2 pr-3">{t("resellers.detail.stage")}</th>
                    <th className="text-left py-2 pr-3">{t("resellers.detail.amount")}</th>
                    <th className="text-left py-2">{t("resellers.detail.closeDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reseller.pipeline.map((d: ResellerDeal) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-3 font-medium">{d.name}</td>
                      <td className="py-3 pr-3">
                        <StageBadge stage={d.stage} />
                      </td>
                      <td className="py-3 pr-3 font-semibold">{d.amount}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(d.closeDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="k-card p-5">
      <div className="flex items-center justify-between">
        <div className="k-label">{label}</div>
        <div className="h-8 w-8 rounded-md bg-secondary/10 text-secondary grid place-items-center">{icon}</div>
      </div>
      <div className="text-[22px] font-bold mt-2 tracking-tight">{value}</div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-0.5">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function StageBadge({ stage }: { stage: ResellerDeal["stage"] }) {
  const styles: Record<ResellerDeal["stage"], string> = {
    Qualification: "bg-muted text-foreground",
    Proposition: "bg-secondary/10 text-secondary",
    Négociation: "bg-warning-soft text-warning-foreground",
    Gagné: "bg-tertiary/10 text-tertiary",
    Perdu: "bg-error/10 text-error",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${styles[stage]}`}>
      {stage}
    </span>
  );
}
