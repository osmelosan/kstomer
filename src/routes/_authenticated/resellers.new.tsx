import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useResellers } from "@/hooks/use-resellers";
import { useCompany } from "@/lib/company-context";
import { PhoneInput } from "@/components/PhoneInput";

export const Route = createFileRoute("/_authenticated/resellers/new")({
  head: () =>
    pageHead({
      routeKey: "resellers",
      title: i18n.t("resellers.new.metaTitle"),
      path: "/resellers/new",
      noindex: true,
    }),
  component: NewReseller,
});

function NewReseller() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { current } = useCompany();
  const { createReseller } = useResellers();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (current.id === "all") {
    return (
      <AppShell title={t("resellers.new.title")}>
        <div className="k-card p-8 max-w-3xl text-sm text-muted-foreground">
          <p>{t("resellers.noCompany")}</p>
          <Link to="/settings" className="text-secondary font-semibold hover:underline">
            {t("newContact.noCompanyCta")}
          </Link>
        </div>
      </AppShell>
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = t("newContact.errors.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await createReseller({
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });
      if (created) nav({ to: "/resellers/$id", params: { id: created.id } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title={t("resellers.new.title")} subtitle={t("resellers.new.subtitle")}>
      <form onSubmit={handleSubmit} noValidate className="k-card p-8 max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label={t("resellers.new.name")}
            value={form.name}
            error={errors.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Field
            label={t("resellers.new.company")}
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
          />
          <Field
            label={t("resellers.new.email")}
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <div>
            <label className="block text-sm font-semibold mb-2">{t("resellers.new.phone")}</label>
            <PhoneInput
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              className="h-11"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => nav({ to: "/resellers" })}
            className="h-10 px-4 rounded-md border border-input bg-card text-sm font-medium"
          >
            {t("newContact.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {t("resellers.new.create")}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full h-11 px-3 rounded-md border bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
