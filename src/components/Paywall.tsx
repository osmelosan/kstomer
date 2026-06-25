import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Paywall() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-10 text-center">
        <Logo variant="horizontal" theme="on-light" className="h-12 mx-auto mb-8" />
        <div className="mx-auto h-12 w-12 rounded-full bg-secondary/10 grid place-items-center">
          <Lock className="h-6 w-6 text-secondary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Choisissez un plan pour continuer
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre espace Kstomer est prêt. Démarrez avec un essai gratuit de 14 jours
          sur le plan Expansion, ou sélectionnez le plan adapté à votre activité.
        </p>
        <Link
          to="/pricing"
          className="mt-8 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Voir les tarifs
        </Link>
        <div className="mt-6 text-xs text-muted-foreground">
          <Link to="/settings" className="underline">Gérer mon compte</Link>
          <span className="mx-2">·</span>
          <Link to="/auth" className="underline">Se déconnecter</Link>
        </div>
      </div>
    </main>
  );
}
