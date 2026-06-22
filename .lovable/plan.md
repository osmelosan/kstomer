## Audit & améliorations — Kstomer CRM

### Constat (audit rapide)

**Logo / branding**
- La sidebar utilise `kstomer-on-dark.png` — PNG non transparent, halo visible sur le navy.
- La version officielle transparente (`Kstomer-light-transparent.png`) est déjà uploadée mais non utilisée.
- Le logo est forcé à `h-10` arbitraire et ne remplit pas la largeur disponible de la sidebar.
- Aucun composant `<Logo />` réutilisable.
- Favicon SVG OK, mais pas d'`apple-touch-icon` ni d'`og:image`.

**SEO & métadonnées**
- Seul `dashboard.tsx` définit un `<title>`. Index, kanban, contacts, resellers, archives, analytics, settings, onboarding n'en ont pas.
- Pas de meta description globale, pas d'OG/Twitter card.

**Accessibilité**
- Boutons icônes (Bell, HelpCircle, MoreVertical, Check) sans `aria-label`.
- Champ recherche sans `<label>`.
- Pas de focus-visible cohérent sur les liens sidebar.
- Contraste `text-sidebar-muted` à vérifier.

**UX shell**
- Topbar : avatar à gauche avant la recherche → ordre inhabituel ; manque ⌘K, badge sur la cloche.
- Sidebar : pas de barre 2px d'accent à gauche pour l'item actif (cf. DESIGN.md).
- Pas de gestion responsive sous 1024/768px.
- Aucun feedback de chargement / état vide sur Contacts, Kanban, Analytics, Archives.

**Cohérence design**
- `MetricCard` sans sparkline (mentionné dans DESIGN.md).
- Kanban : barre verticale 2px d'urgence absente.
- `tagClasses` dupliqué.

**Performance**
- PNG du logo importés directement dans le bundle → externaliser via `lovable-assets`.
- Pas de `loading="lazy"` / `decoding="async"`.

---

### Plan d'amélioration (par lots)

**Lot 1 — Logo & branding (priorité immédiate)**

1. Uploader sur le CDN via `lovable-assets create` :
   - `Kstomer-light-transparent.png` → seul logo utilisé partout (fond transparent, blanc, fonctionne sur navy de la sidebar et resterait propre sur tout fond sombre).
   - `Kstomer-isotipo.svg` → favicon haute résolution / `apple-touch-icon` / `og:image`.
   Chacun produit un `.asset.json` sous `src/assets/`.
2. Créer `src/components/Logo.tsx` :
   - Props : `className?`, `eager?: boolean`.
   - Utilise toujours le logo transparent unique. Pas de variantes light/dark — un seul fichier.
   - Image avec `decoding="async"`, `loading="eager"` pour la sidebar (au-dessus du fold), `loading="lazy"` ailleurs.
   - `alt="Kstomer Smart CRM"`.
3. **Dimensionner le logo de la sidebar pour qu'il occupe l'espace disponible avec un rendu naturel** :
   - Zone réservée en haut de la sidebar : largeur sidebar (240px) − padding latéral 16px de chaque côté = ~208px utiles, hauteur ~64px.
   - `<Logo className="w-full max-h-12 h-auto object-contain object-left" />` :
     - `w-full` exploite toute la largeur disponible.
     - `max-h-12` (48px) plafonne la hauteur pour ne pas écraser la nav.
     - `object-contain object-left` préserve le ratio et aligne à gauche, jamais étiré.
     - `eager` car au-dessus du fold.
   - Padding du conteneur : `px-5 pt-6 pb-6`.
4. Remplacer l'`<img>` direct dans `AppShell` par `<Logo />`.
5. Utiliser le même `<Logo />` (avec une `max-h` adaptée) sur `index.tsx` (welcome) et `onboarding.tsx`. Sur les fonds clairs de ces pages, on l'affichera dans un bandeau sombre minimal pour rester lisible (cf. la version transparente est conçue pour fonds sombres).
6. Supprimer les anciens PNG une fois sans référence : `kstomer-on-dark.png`, `kstomer-dark-on-light.png`.
7. Ajouter dans `__root.tsx` : `apple-touch-icon` (basé sur l'isotipo), `og:image` + `twitter:image` (1200×630, à générer à partir de l'isotipo si besoin).

**Lot 2 — SEO & métadonnées**
- Helper `makeHead({ title, description, image? })` consommé par `head:` de chaque route.
- Couvrir Dashboard, Kanban, Contacts, Resellers, Archives, Analytics, Settings, Onboarding, Landing.
- `__root.tsx` : `lang="fr"`, description globale, OG/Twitter, `theme-color="#0F1B3D"`.

**Lot 3 — Accessibilité**
- `aria-label` sur tous les boutons icônes.
- `<label>` masqué visuellement sur les recherches.
- Focus-visible cohérent (`focus-visible:ring-2 ring-ring`) sur Link / button / input.

**Lot 4 — UX shell**
- Topbar : avatar à droite, recherche centrale large, raccourci ⌘K, popover notifications avec badge.
- Sidebar : barre 2px d'accent à gauche sur l'item actif.
- Responsive : sidebar collapsible sous 1024px, drawer mobile (`Sheet` shadcn) sous 768px.

**Lot 5 — Cohérence design**
- Sparkline sur `MetricCard`.
- Kanban : barre verticale 2px d'urgence (amber J-3, rouge retard).
- Centraliser `tagClasses`.
- États vides illustrés sur Contacts, Kanban, Archives.

**Lot 6 — Perf**
- Tous les PNG via `lovable-assets`.
- `loading="lazy"` + `decoding="async"` sur images non-LCP.

---

### Détails techniques

- `Logo.tsx` lit le `.asset.json` du logo transparent unique. Usage typique : `<Logo className="w-full max-h-12 h-auto object-contain object-left" eager />`.
- Dimensionnement basé sur `object-contain` + bornes `w-full` / `max-h-12` plutôt qu'une hauteur fixe — robuste si la sidebar change de largeur.
- Aucune logique métier modifiée — uniquement présentation, branding, SEO, a11y, perf.

### Question
Souhaites-tu **tout enchaîner** ou démarrer par le **Lot 1** seul (logo transparent unique dimensionné + composant `<Logo />` + favicons/OG) et valider avant la suite ?