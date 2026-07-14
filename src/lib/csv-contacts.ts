import Papa from "papaparse";
import type { ContactStage } from "@/hooks/use-contacts";

export const CSV_CONTACT_COLUMNS = [
  "name",
  "company",
  "email",
  "phone",
  "stage",
  "renewal_date",
  "last_contact_date",
] as const;
export type CsvContactColumn = (typeof CSV_CONTACT_COLUMNS)[number];

export const VALID_STAGES: ContactStage[] = [
  "new_lead",
  "contacted",
  "proposal",
  "active",
  "at_risk",
];

export type CsvRowErrorCode =
  | "missing_name"
  | "invalid_email"
  | "invalid_stage"
  | "invalid_renewal_date"
  | "invalid_last_contact_date";

export type ImportContactRow = {
  contact_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  stage: ContactStage;
  renewal_date: string | null;
  last_contact_date: string | null;
};

export type ParsedCsvRow = ImportContactRow & {
  rowNumber: number;
  errors: CsvRowErrorCode[];
};

export type CsvParseResult = {
  rows: ParsedCsvRow[];
  validRows: ParsedCsvRow[];
  invalidRows: ParsedCsvRow[];
  unknownColumns: string[];
  missingColumns: CsvContactColumn[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value: string): string | null | "invalid" {
  if (!value) return null;
  if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) return "invalid";
  return value;
}

// Detects files that aren't plain-text CSV — e.g. a .numbers or .xlsx file
// renamed/exported with a .csv extension. Those decode as garbage (zip
// signature "PK", binary control chars) rather than as one bad row, so we
// want to reject the whole file with a clear message instead of flooding
// the preview with hundreds of "name is required" errors.
export function looksLikeBinaryFile(fileText: string): boolean {
  if (fileText.startsWith("PK") || fileText.startsWith("PK")) return true;
  const sample = fileText.slice(0, 2000);
  if (sample.length === 0) return false;
  let suspicious = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code === 0xfffd || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      suspicious++;
    }
  }
  return suspicious / sample.length > 0.02;
}

export function parseContactsCsv(fileText: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const fields = result.meta.fields ?? [];
  const unknownColumns = fields.filter((f) => !CSV_CONTACT_COLUMNS.includes(f as CsvContactColumn));
  const missingColumns = CSV_CONTACT_COLUMNS.filter((c) => c === "name" && !fields.includes(c));

  const rows: ParsedCsvRow[] = result.data.map((raw, index) => {
    const errors: CsvRowErrorCode[] = [];

    const name = (raw.name ?? "").trim();
    if (!name) errors.push("missing_name");

    const company = (raw.company ?? "").trim();

    const emailRaw = (raw.email ?? "").trim();
    let email: string | null = null;
    if (emailRaw) {
      if (EMAIL_RE.test(emailRaw)) {
        email = emailRaw;
      } else {
        errors.push("invalid_email");
      }
    }

    const phone = (raw.phone ?? "").trim();

    const stageRaw = (raw.stage ?? "").trim().toLowerCase();
    let stage: ContactStage = "new_lead";
    if (stageRaw) {
      const match = VALID_STAGES.find((s) => s === stageRaw);
      if (match) {
        stage = match;
      } else {
        errors.push("invalid_stage");
      }
    }

    const renewalRaw = (raw.renewal_date ?? "").trim();
    const renewalNormalized = normalizeDate(renewalRaw);
    let renewal_date: string | null = null;
    if (renewalNormalized === "invalid") {
      errors.push("invalid_renewal_date");
    } else {
      renewal_date = renewalNormalized;
    }

    const lastContactRaw = (raw.last_contact_date ?? "").trim();
    const lastContactNormalized = normalizeDate(lastContactRaw);
    let last_contact_date: string | null = null;
    if (lastContactNormalized === "invalid") {
      errors.push("invalid_last_contact_date");
    } else {
      last_contact_date = lastContactNormalized;
    }

    return {
      rowNumber: index + 1,
      contact_name: name,
      company_name: company || null,
      email,
      phone: phone || null,
      stage,
      renewal_date,
      last_contact_date,
      errors,
    };
  });

  return {
    rows,
    validRows: rows.filter((r) => r.errors.length === 0),
    invalidRows: rows.filter((r) => r.errors.length > 0),
    unknownColumns,
    missingColumns,
  };
}

export function dedupeByEmail(rows: ParsedCsvRow[]): {
  deduped: ParsedCsvRow[];
  duplicateCount: number;
} {
  const seen = new Set<string>();
  const deduped: ParsedCsvRow[] = [];
  let duplicateCount = 0;

  for (const row of rows) {
    const key = row.email?.toLowerCase() ?? null;
    if (key && seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    if (key) seen.add(key);
    deduped.push(row);
  }

  return { deduped, duplicateCount };
}

export function generateContactsCsvTemplate(): string {
  const rows = [
    [...CSV_CONTACT_COLUMNS],
    [
      "Jane Doe",
      "Acme Inc",
      "jane@acme.com",
      "+1 555 123 4567",
      "new_lead",
      "2026-12-01",
      "2026-06-15",
    ],
  ];
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadContactsCsvTemplate(filename = "contacts-template.csv") {
  const csv = generateContactsCsvTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
