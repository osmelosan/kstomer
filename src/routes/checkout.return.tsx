import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center k-card p-10">
        <div className="mx-auto h-14 w-14 rounded-full bg-tertiary/10 grid place-items-center">
          <CheckCircle2 className="h-8 w-8 text-tertiary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {session_id ? "Paiement confirmé" : "Aucune session trouvée"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session_id
            ? "Votre abonnement est actif. Vous pouvez accéder à votre espace."
            : "Aucune information de session reçue."}
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          Aller au tableau de bord
        </Link>
      </div>
    </main>
  );
}
