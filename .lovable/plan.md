## Objectif

Créer une fiche revendeur détaillée, accessible en cliquant sur le nom d'un partenaire dans la liste `/resellers`.

## Pages & routes

- Nouvelle route : `src/routes/_authenticated/resellers.$id.tsx` → URL `/resellers/:id`
- Modification de `src/routes/_authenticated/resellers.tsx` :
  - Ajout d'un `id` (slug) à chaque entrée dans `RESELLERS`, extraction dans `src/lib/mock-resellers.ts` pour partager les données entre la liste et la fiche
  - Le nom du partenaire dans le tableau devient un `<Link to="/resellers/$id" params={{ id }}>` stylé (couleur secondary, hover underline)
  - Toute la ligne reste cliquable via un wrapper accessible

## Contenu de la fiche revendeur

Layout deux colonnes (suivant le pattern de `contacts.$id.tsx`) :

**En-tête**
- Avatar/initiales, nom, badge tier (Bronze/Silver/Gold), bouton retour, menu actions (email, appel, archiver)
- KPIs en ligne : deals actifs, CA généré, taux de conversion, santé (5 segments)

**Colonne principale**
- Bloc « Affaires en cours » : liste mock d'opportunités (nom, montant, stage, date close prévue) avec lien vers le kanban
- Bloc « Historique des deals » : derniers deals clôturés (gagné/perdu, montant, date)
- Bloc « Notes » : zone éditable avec autosave (réutilise `useAutosave`)

**Sidebar droite**
- Coordonnées : contact principal, email (`mailto:`), téléphone (`tel:`), site web, adresse
- Infos commerciales : tier, date d'onboarding, account manager, segment
- Contacts associés (mock) : 2-3 personnes chez le revendeur

## i18n

Ajout des clés dans `fr.ts`, `en.ts`, `es.ts` sous `resellers.detail.*` : titres de sections, labels (coordonnées, deals actifs, historique, notes, contact principal, etc.), tooltips, `notFound`.

## SEO

`head()` avec `pageHead({ routeKey: "resellerDetail", noindex: true })` — titre dynamique avec nom du revendeur.

## Détails techniques

- Mock data centralisé dans `src/lib/mock-resellers.ts` exportant `RESELLERS` (avec `id`, `email`, `phone`, `website`, `address`, `accountManager`, `onboardedAt`, `activeDeals[]`, `closedDeals[]`, `contacts[]`)
- Lookup par `id` côté route ; si introuvable → `notFoundComponent` avec lien retour
- `errorComponent` standard avec `router.invalidate()` + `reset()`
- Réutilisation des composants existants (`AppShell`, `k-card`, `AutosaveIndicator`)
- Aucune modification de logique métier ni de backend (données mock uniquement pour l'instant)
