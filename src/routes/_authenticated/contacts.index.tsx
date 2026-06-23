import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Plus, LayoutGrid, List } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/contacts/")({
  head: () => ({ meta: [{ title: i18n.t("contacts.metaTitle") }] }),
  component: Contacts,
});

type Tone = "success" | "warning" | "muted";

const CONTACTS = [
  {
    id: "jean-dupont",
    initials: "JD",
    name: "Jean Dupont",
    email: "jean.dupont@techcorp.fr",
    company: "TechCorp Solutions",
    statusKey: "contacts.statuses.activeClient",
    tone: "success" as Tone,
    activityKey: "contacts.activities.twoDays",
  },
  {
    id: "marie-lefebvre",
    initials: "ML",
    name: "Marie Lefebvre",
    email: "marie.l@innovate.co",
    company: "Innovate & Co",
    statusKey: "contacts.statuses.hotProspect",
    tone: "warning" as Tone,
    activityKey: "contacts.activities.today",
  },
  {
    id: "pierre-durand",
    initials: "PD",
    name: "Pierre Durand",
    email: "pdurand@logistics.net",
    company: "Global Logistics",
    statusKey: "contacts.statuses.inactive",
    tone: "muted" as Tone,
    activityKey: "contacts.activities.twoMonths",
  },
];

function statusCls(t: Tone) {
  return t === "success"
    ? "bg-success-soft text-success border-success/20"
    : t === "warning"
      ? "bg-warning-soft text-warning-foreground border-warning/30"
      : "bg-muted text-muted-foreground border-border";
}

function Contacts() {
  const { t } = useTranslation();
  return (
    <AppShell
      search={{ placeholder: t("contacts.searchPlaceholder") }}
      title={t("contacts.title")}
      subtitle={t("contacts.subtitle")}
      actions={
        <Link
          to="/contacts/new"
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> {t("contacts.newContact")}
        </Link>
      }
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            <Filter className="h-4 w-4" /> {t("contacts.filters")}
          </button>
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            {t("contacts.statusAll")} <ChevronDown className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            {t("contacts.sourceAll")} <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-input bg-card p-1">
          <button className="h-8 w-8 grid place-items-center rounded bg-muted">
            <List className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 grid place-items-center rounded text-muted-foreground hover:bg-muted">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="k-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border bg-muted/40">
              <th className="text-left p-4 w-10"></th>
              <th className="text-left p-4">{t("contacts.th.name")}</th>
              <th className="text-left p-4">{t("contacts.th.company")}</th>
              <th className="text-left p-4">{t("contacts.th.status")}</th>
              <th className="text-left p-4">{t("contacts.th.lastActivity")}</th>
              <th className="text-right p-4">{t("contacts.th.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {CONTACTS.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="p-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-input" />
                </td>
                <td className="p-4">
                  <Link to="/contacts/$id" params={{ id: c.id }} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary/15 text-secondary text-xs font-bold grid place-items-center">
                      {c.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </div>
                  </Link>
                </td>
                <td className="p-4">{c.company}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${statusCls(c.tone)}`}>
                    {t(c.statusKey)}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{t(c.activityKey)}</td>
                <td className="p-4 text-right text-muted-foreground">…</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <div>
            <Trans
              i18nKey="contacts.showing"
              values={{ from: "1-3", total: "150" }}
              components={[<strong className="text-foreground" />, <strong className="text-foreground" />]}
            />
          </div>
          <div className="flex gap-2">
            <button className="h-8 w-8 grid place-items-center rounded-md border border-input">‹</button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-input">›</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
