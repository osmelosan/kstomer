## Objectif

Rendre le dashboard utilisable "on the go" sur mobile et permettre de réduire la sidebar en mode icônes sur desktop.

## 1. Sidebar repliable (desktop)

`src/components/AppShell.tsx`
- Ajouter un state `collapsed` persisté dans `localStorage` (`kstomer.sidebar.collapsed`).
- Largeur sidebar : `w-60` → `w-16` quand replié ; ajuster `ml-60` → `ml-16` sur le contenu.
- Quand replié : masquer les labels (`<span>{t(key)}</span>`), centrer les icônes, remplacer le logo horizontal par le logo compact, et réduire le bloc user à l'avatar seul (dropdown conservé).
- Ajouter un bouton toggle (icône `PanelLeftClose` / `PanelLeftOpen`) dans le header à gauche du `CompanySwitcher` (desktop uniquement, ≥ md).
- Tooltips sur les items de nav quand replié (composant `Tooltip` shadcn déjà dispo).

## 2. Sidebar mobile (off-canvas)

- En dessous de `md`, la sidebar passe en mode drawer : cachée par défaut (`-translate-x-full`), s'ouvre via un bouton hamburger dans le header.
- Overlay sombre cliquable pour fermer. Fermeture automatique sur navigation.
- Le header devient compact sur mobile : hamburger + logo compact + `NotificationsPopover` + avatar menu. `CommandPaletteTrigger` et `CompanySwitcher` cachés sous `md` (déplacés dans le drawer).

## 3. FAB "Quick Actions" mobile

Nouveau composant `src/components/MobileQuickActions.tsx` :
- Bouton flottant rond (bottom-right, `fixed bottom-4 right-4 md:hidden`) avec icône `Plus`.
- Au tap, ouvre un `Sheet` (bottom sheet shadcn) avec 2 actions principales :
  1. **Nouvelle opportunité** → ouvre un mini-formulaire (nom, montant, colonne pipeline, tag) qui pousse dans `localStorage` `kstomer.kanban.v1` (même format que `kanban.tsx`), puis toast + lien "Voir dans le pipeline".
  2. **Note sur un contact** → étape 1 : combobox de sélection contact (liste depuis mock contacts existants), étape 2 : textarea + bouton "Ajouter". Sauvegarde via la même mécanique d'autosave/notes que `contacts.$id.tsx` (clé localStorage existante).
- Monté dans `AppShell` pour être dispo partout, mais affiché uniquement sur mobile.

## 4. Dashboard mobile

`src/routes/_authenticated/dashboard.tsx`
- KPI cards : grille passe de `grid-cols-4` → `grid-cols-2 md:grid-cols-4`, padding réduit sur mobile.
- Actions prioritaires & suggestions IA : empilage vertical, tap target ≥ 44px, troncature avec `truncate` + `min-w-0`.
- Padding du `<main>` : `px-4 md:px-8 py-4 md:py-8` (modif dans `AppShell`).
- Titre h1 : `text-2xl md:text-[36px]`.

## Détails techniques

- Aucun changement backend ; les nouvelles opportunités et notes utilisent les mêmes clés `localStorage` que les pages existantes pour rester synchronisées.
- i18n : ajouter clés `quickActions.*` (FR/EN/ES) — `newOpportunity`, `addNote`, `selectContact`, `notePlaceholder`, `sidebarCollapse`, `sidebarExpand`.
- Respect des patterns responsive du système (grid + `min-w-0` + `shrink-0`).
- Sidebar utilise transition CSS (`transition-[width,transform] duration-200`).

## Test rapide

1. Desktop : clic sur toggle → sidebar passe en icônes, tooltips au hover, état persisté après reload.
2. Mobile (devtools 375px) : hamburger ouvre le drawer, FAB visible en bas à droite.
3. FAB → "Nouvelle opportunité" → remplir → toast → aller sur `/kanban` → carte présente.
4. FAB → "Note contact" → choisir contact → écrire → aller sur la fiche contact → note visible dans la timeline.
