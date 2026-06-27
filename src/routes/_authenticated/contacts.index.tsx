import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Plus, LayoutGrid, List } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/contacts/")({
  head: () =>
    pageHead({
      routeKey: "contacts",
      title: i18n.t("contacts.metaTitle"),
      path: "/contacts",
      noindex: true,
    }),
  component: Contacts,
});

type Tone = "success" | "warning" | "muted";
type StatusFilter = "all" | "activeClient" | "hotProspect" | "inactive";
type SourceFilter = "all" | "web" | "referral" | "email";

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
    source: "referral" as SourceFilter,
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
    source: "web" as SourceFilter,
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
    source: "email" as SourceFilter,
  },
];

function statusCls(t: Tone) {
  return t === "success"
    ? "bg-success-soft text-success border-success/20"
    : t === "warning"
      ? "bg-warning-soft text-warning-foreground border-warning/30"
      : "bg-muted text-muted-foreground border-border";
}

const STATUS_OPTIONS: { value: StatusFilter; labelKey: string }[] = [
  { value: "all", labelKey: "contacts.statusAll" },
  { value: "activeClient", labelKey: "contacts.statuses.activeClient" },
  { value: "hotProspect", labelKey: "contacts.statuses.hotProspect" },
  { value: "inactive", labelKey: "contacts.statuses.inactive" },
];

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Source: all" },
  { value: "web", label: "Web" },
  { value: "referral", label: "Referral" },
  { value: "email", label: "Email" },
];

function Contacts() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filtered = CONTACTS.filter((c) => {
    const statusMatch =
      statusFilter === "all" ||
      c.statusKey === `contacts.statuses.${statusFilter}`;
    const sourceMatch = sourceFilter === "all" || c.source === sourceFilter;
    return statusMatch && sourceMatch;
  });

  const statusLabel =
    statusFilter === "all"
      ? t("contacts.statusAll")
      : t(`contacts.statuses.${statusFilter}`);

  const sourceLabel =
    SOURCE_OPTIONS.find((o) => o.value === sourceFilter)?.label ?? "Source: all";

  return (
    <AppShell
      search={{ placeholder: t("contacts.searchPlaceholder") }}
      title={t("contacts.title")}
      subtitle={t("contacts.subtitle")}
      actions={
          <Link
            to="/contacts/new"
            className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
                {statusLabel} <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setStatusFilter(opt.value)}
                  className={statusFilter === opt.value ? "font-semibold" : ""}
                >
                  {t(opt.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
                {sourceLabel} <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SOURCE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setSourceFilter(opt.value)}
                  className={sourceFilter === opt.value ? "font-semibold" : ""}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            {filtered.map((c) => (
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
              values={{ from: filtered.length, total: CONTACTS.length }}
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
