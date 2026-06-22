import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Plus, LayoutGrid, List } from "lucide-react";

export const Route = createFileRoute("/contacts/")({
  head: () => ({ meta: [{ title: "Contacts — Kstomer" }] }),
  component: Contacts,
});

const CONTACTS = [
  {
    id: "jean-dupont",
    initials: "JD",
    name: "Jean Dupont",
    email: "jean.dupont@techcorp.fr",
    company: "TechCorp Solutions",
    status: { label: "Client Actif", tone: "success" as const },
    activity: "Il y a 2 jours",
  },
  {
    id: "marie-lefebvre",
    initials: "ML",
    name: "Marie Lefebvre",
    email: "marie.l@innovate.co",
    company: "Innovate & Co",
    status: { label: "Prospect Chaud", tone: "warning" as const },
    activity: "Aujourd'hui, 10:30",
  },
  {
    id: "pierre-durand",
    initials: "PD",
    name: "Pierre Durand",
    email: "pdurand@logistics.net",
    company: "Global Logistics",
    status: { label: "Inactif", tone: "muted" as const },
    activity: "Il y a 2 mois",
  },
];

function statusCls(t: "success" | "warning" | "muted") {
  return t === "success"
    ? "bg-success-soft text-success border-success/20"
    : t === "warning"
      ? "bg-warning-soft text-warning-foreground border-warning/30"
      : "bg-muted text-muted-foreground border-border";
}

function Contacts() {
  return (
    <AppShell
      search={{ placeholder: "Search contacts…" }}
      title="Contacts"
      subtitle="Gérez vos relations clients et vos opportunités."
      actions={
        <Link
          to="/contacts/new"
          className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nouveau contact
        </Link>
      }
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            Status: All <ChevronDown className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
            Source: All <ChevronDown className="h-4 w-4" />
          </button>
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
              <th className="text-left p-4">Nom & Prénom</th>
              <th className="text-left p-4">Entreprise</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Dernière activité</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {CONTACTS.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-muted/40"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                  />
                </td>
                <td className="p-4">
                  <Link
                    to="/contacts/$id"
                    params={{ id: c.id }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-secondary/15 text-secondary text-xs font-bold grid place-items-center">
                      {c.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.email}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="p-4">{c.company}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${statusCls(c.status.tone)}`}
                  >
                    {c.status.label}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{c.activity}</td>
                <td className="p-4 text-right text-muted-foreground">…</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <div>
            Affichage de <strong className="text-foreground">1-3</strong> sur{" "}
            <strong className="text-foreground">150</strong> contacts
          </div>
          <div className="flex gap-2">
            <button className="h-8 w-8 grid place-items-center rounded-md border border-input">
              ‹
            </button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-input">
              ›
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
