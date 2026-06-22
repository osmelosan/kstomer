# Améliorer la fiche contact (`/contacts/$id`)

L'objectif : transformer la page actuelle (statique, en lecture seule) en véritable fiche CRM riche et éditable, sans backend (état local pour le moment, prêt à brancher Lovable Cloud plus tard).

## 1. Édition en ligne (inline editing)
- Champs cliquables : nom, rôle, email, téléphone, niveau de confiance.
- Au clic → l'élément devient un input/select ; `Entrée` valide, `Échap` annule.
- Le bouton **« Modifier le profil »** bascule toute la fiche en mode édition (tous les champs en même temps) avec actions « Enregistrer » / « Annuler ».
- Ajout de nouveaux champs éditables : entreprise, poste, site web, LinkedIn, adresse, statut (Client actif / Prospect chaud / Inactif), source.

## 2. Tags & statut
- Ligne de tags colorés sous le nom (ex. « VIP », « Premium », « Renouvellement »), ajout/suppression inline.
- Badge de statut à côté du nom avec couleur sémantique (success / warning / muted).

## 3. Historique d'activité (timeline)
Nouvelle section « Activité » sous les notes :
- Timeline verticale avec icônes par type : email envoyé, appel, réunion, note ajoutée, statut modifié, document partagé.
- Chaque entrée : icône + titre + sous-titre + date relative.
- Bouton « + Ajouter une activité » → petit formulaire (type, description).
- Données mock initiales (4-5 entrées) pour montrer le rendu.

## 4. Documents joints
Nouvelle section « Documents » :
- Liste de fichiers (nom, type, taille, date) avec icône par extension (PDF, DOCX, image…).
- Bouton « Téléverser » (zone drop, UI seulement pour l'instant — pas de Cloud encore).
- Actions par fichier : télécharger, supprimer.
- Données mock (devis.pdf, contrat.docx, brief.pdf).

## 5. Notes versionnées
Améliorer le bloc notes existant :
- Lors de « Sauvegarder », pousser la version précédente dans un historique local.
- Le bouton **« Historique des versions »** ouvre un `Sheet` listant les versions (auteur, date, diff visuel simple ou texte complet).
- Possibilité de restaurer une version antérieure.

## 6. Opportunités liées
Sidebar enrichie sous « Partenaires & contacts associés » :
- Nouvelle carte « Opportunités » : 2-3 deals associés au contact (titre, montant, étape Kanban, badge de confiance).
- Lien vers le Kanban.

## 7. Actions rapides en en-tête
À côté de « Modifier le profil », ajouter un menu d'actions rapides (`DropdownMenu`) :
- Envoyer un email (mailto:)
- Appeler (tel:)
- Programmer une relance
- Archiver le contact
- Supprimer

## 8. Métadonnées en pied d'en-tête
Petite ligne discrète : créé le, dernière interaction, propriétaire (utilisateur assigné).

## Détails techniques

- **Fichier principal** : `src/routes/contacts.$id.tsx` (refonte du composant en sections).
- **Sous-composants** locaux au même fichier ou nouveaux dans `src/components/contact/` :
  - `ContactHeader`, `ContactInfoCard`, `ActivityTimeline`, `DocumentsList`, `NotesEditor`, `RelatedOpportunities`, `QuickActionsMenu`.
- **État** : `useState` (mock) pour cette itération — pas de Lovable Cloud activé. Structure prête à devenir des hooks de requête plus tard.
- **i18n** : ajouter toutes les nouvelles clés dans `src/lib/i18n/fr.ts`, `en.ts`, `es.ts` sous `contactDetail.*` (activity, documents, opportunities, quickActions, versionHistory…). Aucun texte en dur.
- **Composants shadcn déjà dispo** : `Input`, `Select`, `Sheet`, `DropdownMenu`, `Badge`, `Dialog`, `Textarea`, `Switch`. Vérifier leur présence avant import.
- **Design tokens** : respecter Kstomer (deep navy, surface white, `k-card`, `k-label`, success/warning soft). Pas de couleurs en dur.
- **Pas de nouvelle route d'édition séparée** — l'édition se fait sur la même page (UX moderne type Notion/Linear). Le bouton existant reste mais déclenche le mode édition global.

## Hors scope (à confirmer)
- Pas d'upload réel de fichier (pas de Cloud activé). Si tu veux un vrai upload + persistance, on activera Lovable Cloud dans une étape suivante.
- Pas encore de page de modification distincte : on garde tout sur `/contacts/$id` en mode édition inline.
