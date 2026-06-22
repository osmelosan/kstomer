import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Building2, User2, DollarSign, History } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/archives")({
  head: () => ({ meta: [{ title: i18n.t("archives.metaTitle") }] }),
  component: Archives,
});

type Tone = "info" | "warning";
const ROWS = [
  { key: "acme", icon: Building2, date: "2023-10-12", typeKey: "archives.types.partner", reasonKey: "archives.reasons.contractExpired", tone: "info" as Tone },
  { key: "dupont", icon: User2, date: "2023-11-04", typeKey: "archives.types.contact", reasonKey: "archives.reasons.inactive2y", tone: "info" as Tone },
  { key: "aurora", icon: DollarSign, date: "2023-12-15", typeKey: "archives.types.opportunity", reasonKey: "archives.reasons.closedLost", tone: "warning" as Tone },
];

function Archives() {
  const { t, i18n: i18nInst } = useTranslation();
  const dateFmt = new Intl.DateTimeFormat(i18nInst.language, { year: "numeric", month: "short", day: "2-digit" });

  return (
    <AppShell
      search={{ placeholder: t("archives.searchPlaceholder") }}
      title={t("archives.title")}
      subtitle={t("archives.subtitle")}
      actions={
        <div className="ml-2 inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-card text-sm">
          <History className="h-4 w-4" />
          <span>
            <Trans i18nKey="archives.storageEfficiency" components={[<strong className="text-success" />]} />
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label={t("archives.totalItems")} value="1 248" />
        <Stat label={t("archives.contacts")} value="842" />
        <Stat label={t("archives.opportunities")} value="306" />
        <Stat label={t("archives.partners")} value="100" />
      </div>

      <div className="k-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
              <Filter className="h-4 w-4" /> {t("archives.categoryAll")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
              {t("archives.archivedLast30")} <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
              {t("archives.applyFilters")}
            </button>
            <button className="h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground">
              {t("archives.reset")}
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border">
              <th className="text-left p-4">{t("archives.th.name")}</th>
              <th className="text-left p-4">{t("archives.th.type")}</th>
              <th className="text-left p-4">{t("archives.th.dateArchived")}</th>
              <th className="text-left p-4">{t("archives.th.reason")}</th>
              <th className="text-right p-4">{t("archives.th.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-muted grid place-items-center text-muted-foreground">
                      <r.icon className="h-4 w-4" />
                    </div>
                    <div className="font-semibold">{t(`archives.rows.${r.key}`)}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                      r.tone === "info"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-warning-soft text-warning-foreground"
                    }`}
                  >
                    {t(r.typeKey)}
                  </span>
                </td>
                <td className="p-4">{dateFmt.format(new Date(r.date))}</td>
                <td className="p-4 italic text-muted-foreground">{t(r.reasonKey)}</td>
                <td className="p-4 text-right">
                  <button className="text-secondary text-sm font-semibold hover:underline">
                    {t("archives.restore")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <div>
            <Trans
              i18nKey="archives.showing"
              values={{ from: "1-3", total: "1 248" }}
              components={[<strong className="text-foreground" />]}
            />
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`h-8 w-8 grid place-items-center rounded-md text-sm ${
                  p === 1 ? "bg-secondary text-secondary-foreground" : "border border-input bg-card"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="k-card p-5">
      <div className="k-label">{label}</div>
      <div className="text-[28px] font-bold mt-2 tracking-tight">{value}</div>
    </div>
  );
}
