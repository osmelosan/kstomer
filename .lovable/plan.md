# Page Revendeurs — Analyse IA du portefeuille

## Objectif
- Supprimer la carte KPI "Tier Gold" (sans valeur analytique).
- Ajouter, à sa place, un **cadre IA** qui analyse le portefeuille de revendeurs et propose des recommandations / next steps actionnables.

## Changements UI (`src/routes/resellers.tsx`)
1. Retirer le `<Kpi label={t("resellers.goldTier")} ... />` et l'icône `Award`.
2. Garder les 2 KPI restants ("Partenaires actifs", "CA partenaires") sur une ligne plus compacte (`md:grid-cols-2`).
3. Ajouter sous les KPI un nouveau composant `AIInsightsCard` :
   - En-tête : icône Sparkles + titre "Analyse IA du portefeuille" + bouton "Régénérer".
   - États : `idle` (CTA "Analyser mon portefeuille"), `loading` (skeleton + texte "Analyse en cours…"), `ready` (markdown rendu), `error` (message + retry).
   - Contenu attendu de l'IA : 3 sections courtes — **Diagnostic**, **Opportunités**, **Next steps** (liste à puces).
   - Styling cohérent avec `k-card`, bordure douce, accent `secondary`.

## Backend — Lovable AI Gateway
- Créer `src/lib/resellers-ai.functions.ts` avec un `createServerFn({ method: "POST" })` :
  - Input : liste des revendeurs `{ name, tier, deals, revenue, health }[]` validée par Zod.
  - Handler : appelle `streamText`/`generateText` via le helper `createLovableAiGatewayProvider` (`src/lib/ai-gateway.server.ts`) avec le modèle `google/gemini-3-flash-preview`.
  - System prompt : "Tu es un analyste CRM. Analyse le portefeuille de revendeurs et propose un diagnostic concis, des opportunités, et 3 next steps actionnables. Réponds en {langue} en markdown."
  - Retourne `{ markdown: string }`.
- Si `LOVABLE_API_KEY` n'existe pas, le provisionner via `ai_gateway--create`.
- Si le helper provider n'existe pas encore dans le projet, le créer (pattern standard Lovable AI Gateway).

## Client
- Appel via `useServerFn` + `useMutation` (TanStack Query déjà présent).
- Auto-lancement au montage de la carte, avec possibilité de "Régénérer".
- Passer `i18n.language` pour que la réponse soit en FR/EN/ES.
- Rendu markdown via `react-markdown` (à ajouter si absent).

## i18n (`fr.ts`, `en.ts`, `es.ts`)
- Supprimer `resellers.goldTier`.
- Ajouter :
  - `resellers.ai.title`
  - `resellers.ai.cta`
  - `resellers.ai.regenerate`
  - `resellers.ai.loading`
  - `resellers.ai.error`
  - `resellers.ai.disclaimer` ("Généré par IA — vérifiez avant action.")

## Gestion d'erreurs
- 429 (rate limit) : toast + message inline "Réessayez dans un instant".
- 402 (crédits) : message indiquant d'ajouter des crédits.
- Autres : message générique + bouton retry.

## Fichiers touchés
- `src/routes/resellers.tsx` (modifié)
- `src/lib/resellers-ai.functions.ts` (créé)
- `src/lib/ai-gateway.server.ts` (créé si absent)
- `src/lib/i18n/{fr,en,es}.ts` (modifiés)
- `package.json` : ajout `ai`, `@ai-sdk/openai-compatible`, `react-markdown` si absents.
