## Suggestion: checklist technique pré-lancement v1

Avant de déployer, je propose une passe rapide de vérifications techniques + 2 corrections de "polish" que j'ai repérées en lisant le code.

### Corrections à faire (rapides, sûres)

1. **`src/routes/index.tsx` (landing publique)**
   - Ligne 78 : `"Voir les tarifs →"` est en dur en français. Le remplacer par une clé i18n (`welcome.seePricing`) en FR/EN/ES, comme le reste de la page.

2. **`src/routes/sitemap[.]xml.ts`**
   - Le sitemap ne liste que `/` et `/auth`. Ajouter `/pricing` (route publique réelle) pour le SEO.

3. **`src/routes/__root.tsx`**
   - Ligne 137 : `<html lang="fr">` est codé en dur alors qu'on a un `useEffect` qui met à jour `document.documentElement.lang` côté client. Utiliser la langue détectée pour le SSR initial (évite un "flash" de langue et améliore l'accessibilité / SEO).

4. **`src/components/HelpMenu.tsx`**
   - Ligne 38 : `window.open("https://docs.lovable.dev", ...)` — lien vers la doc Lovable au lieu d'une doc Kstomer. Soit le retirer, soit pointer vers une page d'aide interne (ou `mailto:` support) en attendant.

### Vérifications à lancer (sans modification de code)

5. **Scan de sécurité** (`security--run_security_scan`) — re-run pour confirmer qu'il ne reste aucune finding critique après les derniers changements Stripe/RLS.
6. **Paramètres de publication** (`publish_settings--get_publish_settings`) — vérifier que la visibilité prévue (public) est bien celle configurée.
7. **Mode test Stripe** — confirmer visuellement que la bannière `PaymentTestModeBanner` s'affiche bien en preview et que `VITE_PAYMENTS_CLIENT_TOKEN` est en `pk_test_*` (et prévoir le swap en `pk_live_*` au moment du go-live réel).

### Hors scope (à faire plus tard si besoin)

- Refonte landing marketing, parcours premier utilisateur sur des données vides, tests E2E. À traiter en v1.1.

### Fichiers touchés

- `src/routes/index.tsx`
- `src/routes/sitemap[.]xml.ts`
- `src/routes/__root.tsx`
- `src/components/HelpMenu.tsx`
- `src/lib/i18n/{fr,en,es}.ts` (1 clé ajoutée)
