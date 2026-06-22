## Objectif
Rendre le bouton "Voir tout" du dashboard fonctionnel et créer une page Tâches dédiée.

## Étapes

1. **Créer `src/routes/tasks.tsx`**
   - Route `/tasks` enveloppée dans `AppShell` (titre i18n `tasks.title`).
   - Liste complète des actions prioritaires (réutiliser les mêmes données mock que `dashboard.tsx`, extraites dans `src/lib/mock-tasks.ts` pour partage).
   - Filtres : par statut (Toutes / À faire / En cours / Terminées) et par priorité (Haute / Moyenne / Basse) via `Tabs` + `Select`.
   - Recherche texte sur le titre.
   - Cartes de tâches avec : titre, contact associé, échéance, badge priorité (Amber pour Haute), case à cocher pour marquer terminée (état local).
   - Bouton "Nouvelle tâche" (ouvre un `Dialog` simple : titre, priorité, échéance → ajout local).
   - État vide illustré si aucune tâche ne correspond aux filtres.

2. **Extraire les tâches mock**
   - Nouveau fichier `src/lib/mock-tasks.ts` exportant le tableau + types `Task`, `TaskPriority`, `TaskStatus`.
   - `dashboard.tsx` consomme depuis ce fichier (top 3 affichés).

3. **Rendre "Voir tout" cliquable**
   - Dans `src/routes/dashboard.tsx`, remplacer le `<button>` placeholder par un `<Link to="/tasks">` stylé identiquement.

4. **i18n**
   - Ajouter dans `fr.ts`, `en.ts`, `es.ts` :
     - `tasks.title`, `tasks.subtitle`
     - `tasks.filters.all|todo|inProgress|done`
     - `tasks.priority.high|medium|low`
     - `tasks.search`, `tasks.new`, `tasks.empty`
     - `tasks.form.title|priority|dueDate|create|cancel`

5. **Navigation**
   - Vérifier que l'entrée "Tâches" existe déjà dans la sidebar `AppShell` ; sinon l'ajouter avec icône `CheckSquare` de lucide-react pointant vers `/tasks`.

## Notes techniques
- Pas de backend : tout en état local (`useState`). Pas d'appel Cloud.
- Route TanStack standard `createFileRoute("/tasks")`, head() avec title/description i18n.
- Réutilisation des composants shadcn existants : `Card`, `Badge`, `Tabs`, `Select`, `Input`, `Dialog`, `Checkbox`, `Button`.
