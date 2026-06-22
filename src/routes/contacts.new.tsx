import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/contacts/new")({
  head: () => ({ meta: [{ title: "Nouveau contact — Kstomer" }] }),
  component: NewContact,
});

function NewContact() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    status: "Prospect",
    notes: "",
  });

  return (
    <AppShell title="Nouveau contact" subtitle="Ajoutez un prospect ou un client à votre CRM.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav({ to: "/contacts" });
        }}
        className="k-card p-8 max-w-3xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Prénom"
            value={form.firstName}
            onChange={(v) => setForm({ ...form, firstName: v })}
          />
          <Field
            label="Nom"
            value={form.lastName}
            onChange={(v) => setForm({ ...form, lastName: v })}
          />
          <Field
            label="Email professionnel"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Téléphone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="Entreprise"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
          />
          <div>
            <label className="block text-sm font-semibold mb-2">Statut</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-11 px-3 rounded-md border border-input bg-card text-sm focus:ring-2 focus:ring-ring/40 focus:outline-none"
            >
              <option>Prospect</option>
              <option>Prospect Chaud</option>
              <option>Client Actif</option>
              <option>Inactif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Notes</label>
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
            Annuler
          </button>
          <button
            type="submit"
            className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Créer le contact
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
