## Objectif

Transformer le Kanban en board pleinement interactif et utilisable au quotidien, avec drag & drop, gestion complète des colonnes et des cartes, tri, recherche, filtres, et persistance.

## Fonctionnalités demandées

### 1. Drag & drop des cartes
- Cartes déplaçables entre colonnes et réordonnables au sein d'une colonne.
- Lib : `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (accessible clavier, léger).

### 2. Gestion des colonnes
- **Renommer** : clic sur le titre → input inline (Entrée / blur pour valider, Échap pour annuler).
- **Créer** : bouton "+ Ajouter une colonne" en fin de board.
- **Supprimer** : menu `MoreHorizontal` → "Supprimer". Si la colonne contient des cartes, `AlertDialog` avec deux options : "Déplacer vers…" (Select des autres colonnes) ou "Tout supprimer".

### 3. Tri
- Sélecteur en haut : **Manuel** (défaut, ordre du drag), **Nom (A→Z)**, **Date de création (récent / ancien)**.
- Tri appliqué via `useMemo` au rendu, sans muter le state (l'ordre manuel est préservé).

### 4. Nettoyage
- Suppression de la ligne "Système opérationnel · Dernière synchro: 14:02".

## Améliorations incluses (toutes)

1. **Persistance localStorage** — l'état du board survit aux rechargements (clé `kstomer.kanban.v1`).
2. **CRUD des cartes** — bouton "+" dans chaque colonne pour ajouter, clic sur une carte pour ouvrir un panneau latéral (`Sheet` shadcn) d'édition : nom, montant, tag, tonalité, confiance, meta/notes ; bouton supprimer.
3. **Filtres rapides** — chips au-dessus du board : par tag, par confiance min (slider 1–5), par plage de montant.
4. **Recherche live** — la barre de recherche AppShell filtre les cartes en temps réel (nom, montant, meta).
5. **Couleur d'accent par colonne** — pastille éditable dans le header de colonne ; colore le bandeau gauche des cartes.
6. **Totaux par colonne** — somme des montants affichée à côté du compteur (ex. `Proposition · 3 · €11.2k`).
7. **Drag des colonnes** — réordonnables par drag du header (même `DndContext`).
8. **Limite WIP** — option par colonne ; badge rouge quand dépassée.
9. **Vue compacte** — toggle global qui réduit la hauteur des cartes.
10. **Export CSV** — bouton "Exporter" qui télécharge l'état courant du pipeline.

## Détails techniques

- Tout reste frontend dans `src/routes/kanban.tsx`, avec extraction de sous-composants si nécessaire :
  - `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `CardEditor` (Sheet), `BoardToolbar`, `EditableTitle`.
- Types :
  ```ts
  type Card = {
    id: string; name: string; amount: number;
    tag: { label: string; tone: "success" | "warning" | "destructive" };
    confidence: number; meta?: string; createdAt: string;
  }
  type Column = { id: string; title: string; cardIds: string[]; accent?: string; wipLimit?: number }
  type Board = { columns: Column[]; cards: Record<string, Card> }
  ```
- IDs : `crypto.randomUUID()`.
- Montants stockés en `number`, formatés à l'affichage (`€4,500`) — sinon tri et totaux deviennent fragiles.
- Persistance : `useEffect` qui sérialise `board` dans `localStorage`, hydratation au mount avec fallback sur le mock initial.
- DnD : un seul `DndContext` enveloppe colonnes + cartes ; `SortableContext` horizontal pour les colonnes, vertical pour les cartes de chaque colonne.
- Tri non-manuel : on dérive `displayedCardIds` par colonne via `useMemo` ; on ne réécrit jamais `cardIds` quand un tri est actif (sinon le retour à "Manuel" perdrait l'ordre).
- Toolbar : `Select` (tri), `Input` recherche (déjà côté AppShell — on lit via callback `onSearch`), chips filtres, switch "Vue compacte", boutons "Exporter CSV" et "Ajouter colonne".
- Sheet d'édition de carte : composants shadcn `Sheet`, `Input`, `Textarea`, `Select`, `Slider`, `Button`.
- Suppression colonne avec cartes : `AlertDialog` shadcn.
- Aucun changement backend, aucun appel réseau.

## Hors scope

- Pas d'historique / undo.
- Pas de partage multi-utilisateurs (nécessiterait Lovable Cloud — à proposer plus tard si besoin).
- Pas d'intégration avec les contacts existants (les cartes restent indépendantes pour ce lot).
