# Raccourcir l'analyse IA

Modifier `src/lib/resellers-ai.functions.ts` pour réduire la sortie d'au moins la moitié :

- **Format compact** : 2 sections au lieu de 3.
  - **Diagnostic** : 1 phrase max (au lieu de 2-3).
  - **Next steps** : 2 actions max (au lieu de 3 + section Opportunités séparée).
- Supprimer la section **Opportunités** (les opportunités peuvent être implicites dans les next steps).
- Ajouter consigne stricte : "Maximum 60 mots au total. Phrases courtes. Pas de remplissage."
- Réécrire les system prompts FR/EN/ES en conséquence.
- Limiter via `maxOutputTokens: 200` dans l'appel `generateText` pour garantir une réponse brève.

Aucun autre fichier modifié.
