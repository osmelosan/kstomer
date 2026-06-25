## Notifications cliquables

Chaque notification du popover (header) redirige vers la fiche/page la plus pertinente, et le popover se ferme après le clic.

### Mapping notification → destination

| # | Notification | Destination |
|---|---|---|
| 1 | Affaire gagnée : StartUp Vision | `/contacts/$id` du contact lié à StartUp Vision |
| 2 | Nouveau message de Maelis B. | `/contacts/$id` de Maelis |
| 3 | Relance en retard | `/tasks?focus=t3` (réutilise le focus existant) |
| 4 | Nouveau contact ajouté | `/contacts/$id` du nouveau contact |
| 5 | Renouvellement à venir | `/contacts/$id` du contact concerné |

### Implémentation

Dans `src/components/NotificationsPopover.tsx` :
- Étendre le type `Notif` avec un champ `link: { to: string; params?: Record<string, string>; search?: Record<string, unknown> }`.
- Mettre à jour chaque item du `SEED` avec une destination (IDs réels tirés de la mock data contacts pour les 4 notifs orientées contact, et `/tasks` + `focus: "t3"` pour la relance).
- Contrôler l'ouverture du `Popover` (`open` / `setOpen`) pour pouvoir le fermer programmatiquement.
- Remplacer le `<li onClick>` par un `<Link>` (de `@tanstack/react-router`) qui :
  - marque la notification comme lue,
  - ferme le popover,
  - navigue vers `link.to` avec `params` / `search` typés.
- Le bouton "Voir tout" garde son comportement actuel.

Aucun changement de logique métier hors de ce composant.
