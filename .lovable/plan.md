## Objectif
Étendre l'essai gratuit 14 jours aux 3 plans (Starter, Expansion, Empire) et supprimer la page d'écran "Choisissez un plan pour continuer" : les utilisateurs non abonnés sont envoyés directement sur `/pricing`.

## Changements

### 1. `src/lib/pricing-plans.ts`
- Ajouter `trialDays: 14` sur **Starter** et **Empire** (Expansion l'a déjà).
- Mettre à jour la liste `features` de Starter et Empire pour inclure "Essai gratuit 14 jours" (déjà présent sur Expansion).

### 2. Suppression de l'étape Paywall
- `src/components/AppShell.tsx` : remplacer le rendu de `<Paywall />` par une redirection immédiate via `<Navigate to="/pricing" replace />` lorsque l'utilisateur n'a pas d'entitlement (et n'est pas sur `/settings`).
- Supprimer le fichier `src/components/Paywall.tsx` (plus utilisé).
- Supprimer l'import de `Paywall` dans `AppShell.tsx`.

### 3. `src/routes/pricing.tsx`
- Mettre à jour le sous-titre : remplacer "Essai gratuit 14 jours sur Expansion" par "Essai gratuit 14 jours sur tous les plans, sans engagement".
- Le badge "Essai gratuit X jours" sur chaque carte fonctionnera automatiquement via `plan.trialDays`.

### 4. i18n (FR/EN/ES)
- Ajuster la clé de sous-titre `/pricing` si elle est traduite (sinon le texte inline ci-dessus suffit).

## Comportement final
- Inscription → arrivée directe sur `/pricing` (au lieu de l'écran intermédiaire).
- Les 3 cartes affichent le badge "Essai gratuit 14 jours" et déclenchent un checkout Stripe avec `trial_period_days: 14`.
- `/settings` reste accessible sans abonnement pour gérer son compte.

## Test
1. Nouveau compte → redirigé sur `/pricing` (plus de page intermédiaire).
2. Cliquer n'importe quel plan → checkout Stripe avec essai 14j (carte `4242 4242 4242 4242`).
3. Retour `/dashboard` accessible immédiatement (statut `trialing`).
