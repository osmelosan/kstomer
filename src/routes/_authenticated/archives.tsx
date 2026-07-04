import { pageHead } from "@/lib/route-seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Building2, User2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { useArchives, type ArchivedItem } from "@/hooks/use-archives";
import { useCompany } from "@/lib/company-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/archives")({
  head: () =>
    pageHead({
      routeKey: "archives",
      title: i18n.t("archives.metaTitle"),
      path: "/archives",
      noindex: true,
    }),
  component: Archives,
});

type CategoryFilter = "all" | "contact" | "partner";
type RangeFilter = "all" | "30" | "90";

function Archives() {
  const { t, i18n: i18nInst } = useTranslation();
  const { current } = useCompany();
  const { items, loading, restore } = useArchives();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");

  const dateFmt = new Intl.DateTimeFormat(i18nInst.language, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rangeStart =
      range === "all" ? null : new Date(Date.now() - Number(range) * 24 * 60 * 60 * 1000);
    return items.filter((it) => {
      if (category !== "all" && it.type !== category) return false;
      if (rangeStart && new Date(it.archived_at) < rangeStart) return false;
      if (q && !it.name.toLowerCase().includes(q) && !it.subtitle?.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, search, category, range]);

  const thisMonthCount = useMemo(() => {
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return items.filter((i) => new Date(i.archived_at) >= start).length;
  }, [items]);

  async function handleRestore(item: ArchivedItem) {
    await restore(item);
    toast.success(t("archives.restored", { name: item.name }));
  }

  return (
    <AppShell
      search={{ placeholder: t("archives.searchPlaceholder"), value: search, onChange: setSearch }}
      title={t("archives.title")}
      subtitle={t("archives.subtitle")}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label={t("archives.totalItems")} value={String(items.length)} />
        <Stat
          label={t("archives.contacts")}
          value={String(items.filter((i) => i.type === "contact").length)}
        />
        <Stat
          label={t("archives.partners")}
          value={String(items.filter((i) => i.type === "partner").length)}
        />
        <Stat label={t("archives.thisMonth")} value={String(thisMonthCount)} />
      </div>

      {current.id === "all" ? (
        <div className="k-card p-6 text-sm text-muted-foreground">{t("archives.noCompany")}</div>
      ) : (
        <div className="k-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-3 bg-muted/40">
            <div className="flex items-center gap-2">
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
                <SelectTrigger className="h-10 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("archives.categoryAll")}</SelectItem>
                  <SelectItem value="contact">{t("archives.contacts")}</SelectItem>
                  <SelectItem value="partner">{t("archives.partners")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={range} onValueChange={(v) => setRange(v as RangeFilter)}>
                <SelectTrigger className="h-10 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("archives.allTime")}</SelectItem>
                  <SelectItem value="30">{t("archives.archivedLast30")}</SelectItem>
                  <SelectItem value="90">{t("archives.archivedLast90")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border">
                <th className="text-left p-4">{t("archives.th.name")}</th>
                <th className="text-left p-4">{t("archives.th.type")}</th>
                <th className="text-left p-4">{t("archives.th.dateArchived")}</th>
                <th className="text-right p-4">{t("archives.th.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {t("archives.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr
                    key={`${it.type}-${it.id}`}
                    className="border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-muted grid place-items-center text-muted-foreground">
                          {it.type === "contact" ? (
                            <User2 className="h-4 w-4" />
                          ) : (
                            <Building2 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <Link
                            to={it.type === "contact" ? "/contacts/$id" : "/resellers/$id"}
                            params={{ id: it.id }}
                            className="font-semibold hover:text-secondary transition-colors"
                          >
                            {it.name}
                          </Link>
                          {it.subtitle && (
                            <div className="text-xs text-muted-foreground">{it.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                          it.type === "contact"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-warning-soft text-warning-foreground"
                        }`}
                      >
                        {t(`archives.types.${it.type}`)}
                      </span>
                    </td>
                    <td className="p-4">{dateFmt.format(new Date(it.archived_at))}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRestore(it)}
                        className="text-secondary text-sm font-semibold hover:underline"
                      >
                        {t("archives.restore")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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
