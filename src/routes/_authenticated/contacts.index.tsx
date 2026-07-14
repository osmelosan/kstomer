import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Plus, Upload } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import i18n from "@/lib/i18n";
import { useState } from "react";
import { useContacts, type ContactStage } from "@/hooks/use-contacts";
import { useCompany } from "@/lib/company-context";
import { useRovingRowNav } from "@/hooks/use-roving-row-nav";
import { CsvContactImport } from "@/components/CsvContactImport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

type StageFilter = "all" | ContactStage;

const STAGE_OPTIONS: { value: StageFilter; labelKey: string }[] = [
  { value: "all", labelKey: "contacts.stageAll" },
  { value: "new_lead", labelKey: "contacts.stages.new_lead" },
  { value: "contacted", labelKey: "contacts.stages.contacted" },
  { value: "proposal", labelKey: "contacts.stages.proposal" },
  { value: "active", labelKey: "contacts.stages.active" },
  { value: "at_risk", labelKey: "contacts.stages.at_risk" },
];

function stageCls(stage: ContactStage) {
  return stage === "active"
    ? "bg-success-soft text-success border-success/20"
    : stage === "at_risk"
      ? "bg-warning-soft text-warning-foreground border-warning/30"
      : "bg-muted text-muted-foreground border-border";
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function Contacts() {
  const { t, i18n: i18nInst } = useTranslation();
  const navigate = useNavigate();
  const { contacts, loading, importContacts } = useContacts();
  const { current } = useCompany();
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [importOpen, setImportOpen] = useState(false);
  const dateFmt = new Intl.DateTimeFormat(i18nInst.language, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const filtered = contacts.filter((c) => stageFilter === "all" || c.stage === stageFilter);
  const { getRowProps } = useRovingRowNav(filtered.length);

  const stageLabel = t(
    STAGE_OPTIONS.find((o) => o.value === stageFilter)?.labelKey ?? "contacts.stageAll",
  );

  return (
    <AppShell
      search={{ placeholder: t("contacts.searchPlaceholder") }}
      title={t("contacts.title")}
      subtitle={t("contacts.subtitle")}
      actions={
        <>
          {current.id !== "all" && (
            <button
              onClick={() => setImportOpen(true)}
              className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-card text-sm font-semibold hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Upload className="h-4 w-4" /> {t("contacts.importCsv")}
            </button>
          )}
          <Link
            to="/contacts/new"
            className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shadow-sm hover:bg-secondary/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Plus className="h-4 w-4" /> {t("contacts.newContact")}
          </Link>
        </>
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
                {stageLabel} <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STAGE_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setStageFilter(opt.value)}
                  className={stageFilter === opt.value ? "font-semibold" : ""}
                >
                  {t(opt.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="k-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border bg-muted/40">
              <th className="text-left p-4">{t("contacts.th.name")}</th>
              <th className="text-left p-4">{t("contacts.th.company")}</th>
              <th className="text-left p-4">{t("contacts.th.status")}</th>
              <th className="text-left p-4">{t("contacts.th.lastActivity")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {t("contacts.empty")}
                </td>
              </tr>
            )}
            {filtered.map((c, i) => {
              const rowProps = getRowProps(i);
              return (
                <tr
                  key={c.id}
                  {...rowProps}
                  onKeyDown={(e) => {
                    rowProps.onKeyDown(e);
                    if (e.key === "Enter") {
                      void navigate({ to: "/contacts/$id", params: { id: c.id } });
                    }
                  }}
                  className="border-b border-border last:border-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:bg-muted/40"
                >
                  <td className="p-4">
                    <Link
                      to="/contacts/$id"
                      params={{ id: c.id }}
                      tabIndex={-1}
                      className="flex items-center gap-3"
                    >
                      <div className="h-9 w-9 rounded-full bg-secondary/15 text-secondary text-xs font-bold grid place-items-center">
                        {initialsOf(c.contact_name)}
                      </div>
                      <div>
                        <div className="font-semibold">{c.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">{c.company_name ?? "—"}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${stageCls(c.stage)}`}
                    >
                      {t(`contacts.stages.${c.stage}`)}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {c.last_contact_date ? dateFmt.format(new Date(c.last_contact_date)) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <div>
            <Trans
              i18nKey="contacts.showing"
              values={{ from: filtered.length, total: contacts.length }}
              components={[
                <strong className="text-foreground" />,
                <strong className="text-foreground" />,
              ]}
            />
          </div>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("contacts.csvImport.title")}</DialogTitle>
            <DialogDescription>{t("contacts.csvImport.subtitle")}</DialogDescription>
          </DialogHeader>
          <CsvContactImport onImport={importContacts} onImported={() => setImportOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
