import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useContacts } from "@/hooks/use-contacts";
import { useCompanyNames } from "@/hooks/use-company-names";
import { useCompany } from "@/lib/company-context";
import { CompanyCombobox } from "@/components/CompanyCombobox";
import { PhoneInput } from "@/components/PhoneInput";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/_authenticated/contacts/new")({
  head: () =>
    pageHead({
      routeKey: "newContact",
      title: i18n.t("newContact.metaTitle"),
      path: "/contacts/new",
      noindex: true,
    }),
  component: NewContact,
});

function NewContact() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { current } = useCompany();
  const { contacts, createContact } = useContacts();
  const { companyNames } = useCompanyNames();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (current.id === "all") {
    return (
      <AppShell title={t("newContact.title")} subtitle={t("newContact.subtitle")}>
        <div className="k-card p-8 max-w-3xl text-sm text-muted-foreground">
          <p>{t("newContact.noCompany")}</p>
          <Link to="/settings" className="text-secondary font-semibold hover:underline">
            {t("newContact.noCompanyCta")}
          </Link>
        </div>
      </AppShell>
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = t("newContact.errors.required");
    if (!form.lastName.trim()) next.lastName = t("newContact.errors.required");
    if (!form.email.trim()) {
      next.email = t("newContact.errors.required");
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = t("newContact.errors.invalidEmail");
    } else if (contacts.some((c) => c.email?.toLowerCase() === form.email.trim().toLowerCase())) {
      next.email = t("newContact.errors.duplicateEmail");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await createContact({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim() || null,
        company_name: form.company.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      if (!created) return;
      if (form.notes.trim()) {
        await supabase.from("contact_notes").insert({
          organization_id: created.organization_id,
          contact_id: created.id,
          note_text: form.notes.trim(),
        });
        await supabase
          .from("contacts")
          .update({ notes_count: created.notes_count + 1 })
          .eq("id", created.id);
      }
      nav({ to: "/contacts/$id", params: { id: created.id } });
    } catch (err: unknown) {
      const pgError = err as { code?: string };
      if (pgError.code === "23505") {
        setErrors((prev) => ({ ...prev, email: t("newContact.errors.duplicateEmail") }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title={t("newContact.title")} subtitle={t("newContact.subtitle")}>
      <form onSubmit={handleSubmit} noValidate className="k-card p-8 max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label={t("newContact.firstName")}
            value={form.firstName}
            error={errors.firstName}
            onChange={(v) => setForm({ ...form, firstName: v })}
          />
          <Field
            label={t("newContact.lastName")}
            value={form.lastName}
            error={errors.lastName}
            onChange={(v) => setForm({ ...form, lastName: v })}
          />
          <Field
            label={t("newContact.email")}
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <div>
            <label className="block text-sm font-semibold mb-2">{t("newContact.phone")}</label>
            <PhoneInput
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              className="h-11"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("newContact.company")}</label>
            <CompanyCombobox
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
              options={companyNames}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t("newContact.notes")}</label>
          <textarea
            rows={5}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-md border border-input p-3 text-sm bg-card focus:ring-2 focus:ring-ring/40 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => nav({ to: "/contacts" })}
            className="h-10 px-4 rounded-md border border-input bg-card text-sm font-medium"
          >
            {t("newContact.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("newContact.create")}
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
