import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Download, Upload } from "lucide-react";
import {
  CSV_CONTACT_COLUMNS,
  dedupeByEmail,
  downloadContactsCsvTemplate,
  parseContactsCsv,
  type CsvParseResult,
  type ImportContactRow,
} from "@/lib/csv-contacts";

type ImportState = "idle" | "parsed" | "importing" | "done";

export function CsvContactImport({
  onImport,
  onImported,
  onSkip,
  skipLabel,
}: {
  onImport: (rows: ImportContactRow[]) => Promise<{ imported: number; skipped: number }>;
  onImported?: (result: { imported: number; skipped: number }) => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<ImportState>("idle");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(
    null,
  );

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseContactsCsv(text);
    const { deduped, duplicateCount: dupes } = dedupeByEmail(parsed.validRows);
    setParseResult({ ...parsed, validRows: deduped });
    setDuplicateCount(dupes);
    setState("parsed");
  }

  async function handleImport() {
    if (!parseResult) return;
    setState("importing");
    try {
      const rows: ImportContactRow[] = parseResult.validRows.map((r) => ({
        contact_name: r.contact_name,
        company_name: r.company_name,
        email: r.email,
        phone: r.phone,
        stage: r.stage,
        renewal_date: r.renewal_date,
        last_contact_date: r.last_contact_date,
      }));
      const result = await onImport(rows);
      const skipped = result.skipped + duplicateCount;
      setImportResult({ imported: result.imported, skipped });
      setState("done");
    } catch {
      toast.error(t("contacts.csvImport.importError"));
      setState("parsed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-sm mb-1">
          {t("contacts.csvImport.instructionsHeading")}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {t("contacts.csvImport.instructionsIntro")}
        </p>
        <ul className="space-y-1.5 text-sm">
          {CSV_CONTACT_COLUMNS.map((col) => (
            <li key={col}>
              <code className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">{col}</code>{" "}
              <span className="text-muted-foreground">{t(`contacts.csvImport.fields.${col}`)}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => downloadContactsCsvTemplate()}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
        >
          <Download className="h-4 w-4" /> {t("contacts.csvImport.downloadTemplate")}
        </button>
      </div>

      {state !== "done" && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            {t("contacts.csvImport.filePickerLabel")}
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-semibold file:text-sm hover:file:bg-secondary/90 file:cursor-pointer"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("contacts.csvImport.filePickerHint")}
          </p>
        </div>
      )}

      {parseResult && state !== "done" && (
        <div>
          <h3 className="font-semibold text-sm mb-2">{t("contacts.csvImport.previewHeading")}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t("contacts.csvImport.previewSummary", {
              valid: parseResult.validRows.length,
              invalid: parseResult.invalidRows.length,
            })}
          </p>
          {parseResult.unknownColumns.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3">
              {t("contacts.csvImport.unknownColumnsWarning", {
                columns: parseResult.unknownColumns.join(", "),
              })}
            </p>
          )}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border bg-muted/40">
                  <th className="text-left p-2">{t("contacts.th.name")}</th>
                  <th className="text-left p-2">{t("contacts.th.company")}</th>
                  <th className="text-left p-2">{t("contacts.csvImport.emailColumn")}</th>
                  <th className="text-left p-2"></th>
                </tr>
              </thead>
              <tbody>
                {parseResult.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-b border-border last:border-0">
                    <td className="p-2">{row.contact_name || "—"}</td>
                    <td className="p-2">{row.company_name ?? "—"}</td>
                    <td className="p-2">{row.email ?? "—"}</td>
                    <td className="p-2">
                      {row.errors.length === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-4 w-4" />
                          {row.errors
                            .map((code) => t(`contacts.csvImport.errors.${code}`))
                            .join("; ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state === "done" && importResult && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          {t("contacts.csvImport.summary", {
            imported: importResult.imported,
            skipped: importResult.skipped,
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {onSkip && state !== "done" && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {skipLabel ?? t("contacts.csvImport.close")}
          </button>
        )}
        {state === "parsed" && (
          <button
            type="button"
            onClick={handleImport}
            disabled={!parseResult || parseResult.validRows.length === 0}
            className="ml-auto inline-flex items-center gap-2 h-11 px-5 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Upload className="h-4 w-4" />
            {t("contacts.csvImport.importButton", { count: parseResult?.validRows.length ?? 0 })}
          </button>
        )}
        {state === "importing" && (
          <button
            type="button"
            disabled
            className="ml-auto inline-flex items-center gap-2 h-11 px-5 rounded-md bg-secondary text-secondary-foreground font-semibold opacity-50"
          >
            {t("contacts.csvImport.importing")}
          </button>
        )}
        {state === "done" && importResult && (
          <button
            type="button"
            onClick={() => onImported?.(importResult)}
            className="ml-auto inline-flex items-center gap-2 h-11 px-5 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
          >
            {t("contacts.csvImport.done")}
          </button>
        )}
      </div>
    </div>
  );
}
