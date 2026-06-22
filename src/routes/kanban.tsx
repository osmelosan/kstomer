import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MoreHorizontal, Mail } from "lucide-react";

export const Route = createFileRoute("/kanban")({
  head: () => ({ meta: [{ title: "Pipeline Commercial — Kstomer" }] }),
  component: KanbanPage,
});

type Card = {
  tag: { label: string; tone: "success" | "warning" | "destructive" };
  amount: string;
  name: string;
  confidence: number;
  meta?: string;
  initials?: string;
};

const COLUMNS: { title: string; count: number; cards: Card[] }[] = [
  {
    title: "Nouveau Lead",
    count: 3,
    cards: [
      {
        tag: { label: "NORMAL", tone: "success" },
        amount: "€4,500",
        name: "Alice Lefebvre",
        confidence: 3,
        meta: "Modifié il y a 2j",
      },
      {
        tag: { label: "URGENT", tone: "warning" },
        amount: "€12,000",
        name: "TechFlow Solutions",
        confidence: 4,
        initials: "TF",
        meta: "Aujourd'hui",
      },
    ],
  },
  {
    title: "Contacté",
    count: 1,
    cards: [
      {
        tag: { label: "SUIVI", tone: "success" },
        amount: "€2,300",
        name: "Marc Antoine",
        confidence: 2,
        meta: "Email envoyé hier",
      },
    ],
  },
  {
    title: "Proposition",
    count: 2,
    cards: [
      {
        tag: { label: "ATTENTE", tone: "warning" },
        amount: "€8,900",
        name: "Cabinet Legrand",
        confidence: 5,
        meta: "Version 2 de la proposition en cours…",
      },
    ],
  },
  {
    title: "Gagné",
    count: 0,
    cards: [],
  },
];

function tagCls(t: Card["tag"]["tone"]) {
  switch (t) {
    case "success":
      return "bg-success-soft text-success";
    case "warning":
      return "bg-warning-soft text-warning-foreground";
    case "destructive":
      return "bg-destructive text-destructive-foreground";
  }
}

function KanbanPage() {
  return (
    <AppShell
      title="Pipeline Commercial"
      subtitle="Visualisez et gérez vos opportunités de vente en temps réel."
      search={{ placeholder: "Rechercher des leads, contacts…" }}
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Système opérationnel
        </span>
        <span>·</span>
        <span>Dernière synchro: 14:02</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {COLUMNS.map((c) => (
          <div
            key={c.title}
            className="rounded-xl bg-muted/60 border border-border p-4 min-h-[460px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-foreground">
                  {c.title}
                </span>
                <span className="text-xs font-semibold rounded-full bg-card border border-border px-2 py-0.5">
                  {c.count}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {c.cards.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card/50 text-muted-foreground text-sm py-10 text-center">
                  Glissez une carte ici
                </div>
              ) : (
                c.cards.map((card) => (
                  <div
                    key={card.name}
                    className="k-card p-4 cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-shadow border-l-2"
                    style={{
                      borderLeftColor:
                        card.tag.tone === "warning"
                          ? "var(--color-warning)"
                          : "var(--color-secondary)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2 py-1 rounded-md ${tagCls(
                          card.tag.tone,
                        )}`}
                      >
                        {card.tag.label}
                      </span>
                      <span className="text-sm font-bold">{card.amount}</span>
                    </div>
                    <h3 className="mt-2 font-semibold">{card.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Confidence value={card.confidence} />
                      <span className="text-xs text-muted-foreground">
                        {card.confidence}/5
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      {card.initials ? (
                        <div className="h-6 w-6 rounded-full bg-foreground text-background grid place-items-center text-[10px] font-bold">
                          {card.initials}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {card.meta?.startsWith("Email") ? card.meta : ""}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {card.meta && !card.meta.startsWith("Email")
                          ? card.meta
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Confidence({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background:
              i <= value
                ? "var(--color-secondary)"
                : "color-mix(in oklab, var(--color-secondary) 18%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
