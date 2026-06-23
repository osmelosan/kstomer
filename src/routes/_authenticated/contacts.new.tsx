import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/contacts/new")({
  head: () => ({ meta: [{ title: i18n.t("newContact.metaTitle") }] }),
  component: NewContact,
});

function NewContact() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    status: "prospect",
    notes: "",
  });

  return (
    <AppShell title={t("newContact.title")} subtitle={t("newContact.subtitle")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav({ to: "/contacts" });
        }}
        className="k-card p-8 max-w-3xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t("newContact.firstName")} value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label={t("newContact.lastName")} value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          <Field label={t("newContact.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label={t("newContact.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label={t("newContact.company")} value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <div>
            <label className="block text-sm font-semibold mb-2">{t("newContact.status")}</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none"
            >
              <option value="prospect">{t("newContact.statusOptions.prospect")}</option>
              <option value="hotProspect">{t("newContact.statusOptions.hotProspect")}</option>
              <option value="activeClient">{t("newContact.statusOptions.activeClient")}</option>
              <option value="inactive">{t("newContact.statusOptions.inactive")}</option>
            </select>
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
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none"
      />
    </div>
  );
}
