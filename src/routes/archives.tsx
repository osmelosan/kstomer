import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Filter, ChevronDown, Building2, User2, DollarSign, History } from "lucide-react";

export const Route = createFileRoute("/archives")({
  head: () => ({ meta: [{ title: "Archives — Kstomer" }] }),
  component: Archives,
});

const ROWS = [
  {
    name: "Acme Global Solutions",
    type: { label: "Partner", tone: "info" as const },
    icon: Building2,
    date: "Oct 12, 2023",
    reason: "Contract expired",
  },
  {
    name: "Jean Dupont",
    type: { label: "Contact", tone: "info" as const },
    icon: User2,
    date: "Nov 04, 2023",
    reason: "Inactive > 2 years",
  },
  {
    name: "Project Aurora",
    type: { label: "Opportunity", tone: "warning" as const },
    icon: DollarSign,
    date: "Dec 15, 2023",
    reason: "Closed lost",
  },
];

function Archives() {
  return (
    <AppShell
      search={{ placeholder: "Search archives…" }}
      title="Archives"
      subtitle="Manage and restore your inactive business records and historical data."
      actions={
        <div className="ml-2 inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-card text-sm">
          <History className="h-4 w-4" />
          <span>
            Storage efficiency:{" "}
            <strong className="text-success">94%</strong>
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total items" value="1,248" />
        <Stat label="Contacts" value="842" />
        <Stat label="Opportunities" value="306" />
        <Stat label="Partners" value="100" />
      </div>

      <div className="k-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
              <Filter className="h-4 w-4" /> Category: All
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-card text-sm">
              Archived: Last 30 Days <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">
              Apply Filters
            </button>
            <button className="h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground">
              Reset
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Date archived</th>
              <th className="text-left p-4">Reason</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.name}
                className="border-b border-border last:border-0 hover:bg-muted/40"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-muted grid place-items-center text-muted-foreground">
                      <r.icon className="h-4 w-4" />
                    </div>
                    <div className="font-semibold">{r.name}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                      r.type.tone === "info"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-warning-soft text-warning-foreground"
                    }`}
                  >
                    {r.type.label}
                  </span>
                </td>
                <td className="p-4">{r.date}</td>
                <td className="p-4 italic text-muted-foreground">{r.reason}</td>
                <td className="p-4 text-right">
                  <button className="text-secondary text-sm font-semibold hover:underline">
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
          <div>
            Showing <strong className="text-foreground">1-3</strong> of 1,248
            items
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`h-8 w-8 grid place-items-center rounded-md text-sm ${
                  p === 1
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-input bg-card"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
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
