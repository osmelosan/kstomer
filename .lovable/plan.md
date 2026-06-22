# Plan

## Objectif
Remplacer le bouton flèche (ArrowUpRight) dans chaque carte "Suggéré par l'IA" du Dashboard par les coordonnées de contact (email + téléphone) du contact clé de l'entreprise, pour permettre une prise de contact directe.

## Étapes

1. **`src/routes/dashboard.tsx` — `ProspectRow`**
   - Supprimer le bouton flèche en haut à droite.
   - Étendre les props avec `contactName`, `email`, `phone`.
   - Ajouter sous le bloc "Match" deux liens d'action discrets :
     - `<a href="mailto:...">` avec icône `Mail` → email du contact
     - `<a href="tel:...">` avec icône `Phone` → téléphone
   - Afficher également le nom du contact (ex. "Camille Roux — Directrice").

2. **Données mock** (inline dans `dashboard.tsx`)
   - Studio Maelis → Camille Roux, camille@studiomaelis.fr, +33 6 12 34 56 78
   - Northgate Logistics → Marc Delvaux, m.delvaux@northgate.io, +33 6 98 76 54 32
   - Boulangerie Lumen → Inès Marchand, ines@lumen-bakery.fr, +33 7 22 11 33 44

3. **i18n** (`fr.ts`, `en.ts`, `es.ts`)
   - Ajouter `dashboard.contactEmail`, `dashboard.contactPhone` (libellés aria/title).

## Notes techniques
- Aucun backend, données mock locales.
- Icônes `Mail` et `Phone` depuis `lucide-react` (Mail déjà importé).
- Pas de modification d'autres routes.
