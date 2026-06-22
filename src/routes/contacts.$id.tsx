import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BadgeCheck, FileText, History } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/contacts/$id")({
  head: () => ({ meta: [{ title: i18n.t("contactDetail.metaTitle") }] }),
  component: ContactDetails,
});

function ContactDetails() {
  const { id } = useParams({ from: "/contacts/$id" });
  const { t } = useTranslation();
  const [note, setNote] = useState(t("contactDetail.sampleNote"));

  const display = id
    .split("-")
    .map((s: string) => (s[0]?.toUpperCase() ?? "") + s.slice(1))
    .join(" ");

  return (
    <AppShell title={t("contactDetail.title")}>
      <div className="mb-4">
        <Link to="/contacts" className="text-sm text-muted-foreground hover:text-foreground">
          {t("contactDetail.back")}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="k-card p-8">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-2xl font-bold text-muted-foreground">
                {display.split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <h2 className="text-[24px] font-bold tracking-tight">{display}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <BadgeCheck className="h-4 w-4 text-secondary" />
                  {t("contactDetail.role")}
                </div>
              </div>
              <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                {t("contactDetail.editProfile")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-border">
              <div>
                <div className="k-label mb-2">{t("contactDetail.workEmail")}</div>
                <div className="font-medium">julien.b@beaumont.digital</div>
                <div className="k-label mt-5 mb-2">{t("contactDetail.phone")}</div>
                <div className="font-medium">+33 6 12 34 56 78</div>
              </div>
              <div>
                <div className="k-label mb-3">{t("contactDetail.confidenceLevel")}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="h-3 flex-1 rounded-full"
                      style={{
                        background:
                          i <= 4
                            ? "var(--color-secondary)"
                            : "color-mix(in oklab, var(--color-secondary) 15%, transparent)",
                      }}
                    />
                  ))}
                </div>
                <div className="mt-3 text-secondary font-semibold text-sm">
                  {t("contactDetail.confidenceLabel")}
                </div>
              </div>
            </div>
          </div>

          <div className="k-card p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-[20px] font-semibold">
                <FileText className="h-5 w-5 text-secondary" />
                {t("contactDetail.projectNotes")}
                <span className="ml-2 inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5 bg-success-soft text-success">
                  {t("contactDetail.modified")}
                </span>
              </h3>
              <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
                <History className="h-4 w-4" /> {t("contactDetail.versionHistory")}
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={7}
              className="w-full rounded-md border border-input p-4 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <div className="flex justify-end mt-4">
              <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                {t("contactDetail.saveNote")}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="k-card p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary/10 grid place-items-center text-secondary">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">TechSolutions</div>
              <div className="text-xs text-muted-foreground">{t("contactDetail.partnerTier")}</div>
            </div>
          </div>
          <div className="k-card p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">SM</div>
            <div>
              <div className="text-sm font-semibold">Sophie Martin</div>
              <div className="text-xs text-muted-foreground">{t("contactDetail.associate")}</div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
