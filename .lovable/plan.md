## Lot 1 — Logos transparents + dimensionnement augmenté partout

### Assets (via `lovable-assets`, transparents)

- **`src/assets/kstomer-horizontal-on-light.png.asset.json`** — nouveau logo uploadé (texte navy, X bleu, fond transparent). Fonds clairs.
- **`src/assets/kstomer-horizontal-on-dark.png.asset.json`** — logo blanc déjà uploadé (`Kstomer-light-transparent.png`). Fonds foncés ; le « I » navy disparaît visuellement, le mot Kstomer reste blanc lisible (contraste ≈ 16:1, WCAG AAA).
- **`src/assets/kstomer-isotipo.svg.asset.json`** — icône X seule (favicon, sidebar collapsée).

Suppression des anciens `kstomer-on-dark.png` / `kstomer-dark-on-light.png` non transparents.

### Composant `src/components/Logo.tsx`

```tsx
<Logo variant="horizontal" | "icon"
      theme="on-dark" | "on-light"
      className?: string />   // pilote la taille via Tailwind
```

`alt="Kstomer Smart CRM"`, `loading="lazy"`, `decoding="async"`, `object-contain`, `w-auto`. Pas de taille codée en dur dans le composant : la taille vient toujours de `className` côté appelant.

### Tailles appliquées (logo plus grand partout)

| Emplacement | Taille actuelle | Nouvelle taille | Justification |
|---|---|---|---|
| **Sidebar header** (240 px de large, padding 16 px → 208 px utiles) | `h-10` (40 px) sur fond non-transparent | `h-12 max-w-[200px]` (48 px, 200 px max) | Remplit l'en-tête `h-16`, marge verticale ≈ 8 px, ratio préservé, le plus grand possible sans toucher les bords |
| **Page de bienvenue / `index.tsx`** (auth, splash) | `h-12 w-12` icône | `h-20 md:h-24` horizontal (80 → 96 px) | Hero centré, le logo devient un véritable point focal |
| **Onboarding header** | `h-12` icône | `h-14` horizontal (56 px) | Plus présent, équilibre la hiérarchie h1 |
| **États vides / footer / modales** | n/a | `h-8` horizontal | Discret mais lisible |
| **Favicon / `apple-touch-icon`** | 32 px | conservé | Standard navigateur |
| **`og:image`** | absent | 1200×630 dérivé de l'horizontal on-light | Partage social |

### Fichiers modifiés

- `src/components/Logo.tsx` *(nouveau)*
- `src/components/AppShell.tsx` — header sidebar : `h-16 px-4`, `<Logo variant="horizontal" theme="on-dark" className="h-12 w-auto max-w-[200px]" />`
- `src/routes/index.tsx` — `<Logo variant="horizontal" theme="on-light" className="h-20 md:h-24 w-auto" />`
- `src/routes/onboarding.tsx` — `<Logo variant="horizontal" theme="on-light" className="h-14 w-auto" />`
- `src/routes/__root.tsx` — `<html lang="fr">`, `apple-touch-icon`, `og:image`, `twitter:image`
- Suppression `src/assets/kstomer-on-dark.png`, `src/assets/kstomer-dark-on-light.png`

### Lots suivants (non exécutés ici)

2. SEO — `makeHead`, meta par route, OG/Twitter.
3. A11y — `aria-label`, `<label>` recherche, focus ring, hiérarchie h1.
4. UX shell — avatar à droite, ⌘K, barre 2 px item actif, sidebar responsive, badge notifications.
5. Cohérence — sparkline MetricCard, barre urgence kanban, tags unifiés, états vides.
6. Perf — tous PNG via `lovable-assets`, `loading="lazy"`, préchargement logo sidebar.

J'exécute le **Lot 1** maintenant ?