# Historique des commits par module

Ce changelog regroupe l'historique git de `kstomer` selon les modules du
bootcamp. Le dépôt ne contient aucun commit pour « Semaine 1 : Cadrage,
Stratégie et Choix de Stack » — ce travail (choix de la stack, scaffolding
initial) a été fait avant le début de cet historique git, donc il n'apparaît
pas ici.

Les modules ont avancé de façon entrelacée (pas en blocs séquentiels), donc
les dates se chevauchent entre les sections.

## 🎯 Semaine 1 — Cadrage, Stratégie et Choix de Stack
_(aucun commit enregistré dans git — travail antérieur à l'historique actuel)_

## 💿 Semaine 2 — Architecture de données et Back-end

- `546b031` feat: wire Contacts to real Supabase data, migrate CRM tables to organizations
- `8fb0a9d` feat: wire Kanban to real Supabase data as a stage-grouped Contacts view
- `9433736` feat: wire Resellers to real Supabase data
- `be20ec2` chore: remove mock-resellers.ts, now unused after Resellers wiring
- `adcb908` chore: regenerate routeTree.gen.ts for the new reseller routes
- `6846ebb` feat: wire Archives to real Supabase data, add archive actions for contacts/resellers
- `a819fd1` feat: add CSV contact import to onboarding and Contacts page
- `09977e3` Fix package name and Supabase project ref mismatches
- `aa36f92` Drop unused projets table
- `4a21adc` Fix README database table list and add DBML v1.4 schema
- `36ed9bc` Add is_test and archived_at to organizations table
- `9c478ec` Add daily GDPR purge cron for archived organizations
- `c7be5dd` Add account archival (GDPR right-to-erasure) to Settings
- `8e3422c` Add account restore flow for the GDPR archival grace period
- `affd4d6` Document the account archival/restore UI flow in the README
- `beb8460` Split contact name into first_name/last_name
- `61cab69` Reject binary files masquerading as CSV in contact import
- `03164eb` Drop full-name field from signup form

## 🎨 Semaine 3 — Front-end

- `2eb3201` Fix mobile contact header overlap and notes placeholder i18n key
- `0f74c10` Merge branch 'claude/mobile-layout-notes-placeholder-elg3rk' into main
- `0ae0448` Skip email confirmation step after signup
- `2747db0` Send new signups to onboarding instead of dashboard
- `7330942` Merge branch 'claude/account-creation-email-03whr1' into main
- `a9a4faa` Add company info step and back navigation to onboarding
- `8a840ea` Add back-to-sign-in button on onboarding's first step
- `9ddcc25` Make onboarding reachable with back nav and language switch
- `1fde541` Merge onboarding flow: reachable, back nav, language switch
- `ed9fd81` Allow editing existing notes on the contact detail page
- `fcc17fd` Allow editing existing notes on the reseller detail page
- `bf01f7f` Add keyboard navigation to contacts, resellers, and kanban screens (#23)
- `24366cb` Default company selector to admin's first company, not all
- `8b10fed` Merge branch 'claude/admin-company-contact-filter-furu2m'
- `54b955d` Fix stale meta description and inaccurate yearly discount badge
- `053e5ff` Format discount calculation to match project prettier style
- `6d4d0ac` Document sign-up flow and contact name split in README
- `3244940` Fix notes not persisting: code targeted dropped notes/note_edit_history tables
- `c306634` Document the notes save-path fix in the README
- `40de20f` Add permanent contact deletion
- `df8c804` Update Empire plan monthly price to €51
- `1d7b34e` Fix Empire plan annual price to €51/month

## 🤖 Semaine 4 — Intelligence métier et automatisation

- `90fe346` Add prompt caching to the Claude system prompts for the AI insight cards
- `9851016` Switch AI insight cards to Haiku 4.5, Prospects to Sonnet 5
- `373c2b5` feat: show fabricated best-contact details on AI prospect suggestions
- `7e5159a` Merge branch 'claude/french-test-data-user-rtmklg'
- `2391d9c` Fix IA analysis 400 error by removing unsupported adaptive thinking on Haiku
- `add517a` Merge branch 'claude/ia-analysis-error-4urynr'
- `ed62d5b` Move AI insights card above the revenue chart in Analytics
- `17729a8` Give each AI insight card a distinct voice, add relationship-health AI to contacts
- `be37d50` Warm prospect suggestions cache at 4am UTC cron
- `c962197` Fix CREDITS_EXHAUSTED misclassification in AI insight functions
- `e629b29` Bound concurrency and add a deadline to the AI cache warm cron
- `a82e56c` Prewarm the dashboard AI briefing cache at 4am UTC

## 📊 Semaine 5 — Dashboards de données et déploiement sécurisé

- `a3d0cac` feat: wire Analytics to real Supabase data, drop two unbacked sections
- `45fb9eb` Add automatic J-30/J-7/J renewal reminders and real notifications feed
- `b85da69` Wire dashboard priority actions to real task data
- `4681926` Auto-publish a GitHub Release on every push to main
- `06151f5` Merge pull request #22 from osmelosan/claude/setup-github-releases
- `e7a7277` Merge pull request #21 from osmelosan/claude/ai-briefing-priority-alignment-lggt7z
- `096fdd4` Add Supabase Realtime sync for contacts, resellers, and tasks (#24)

## 📝 Transversal (docs / général, non rattaché à un module précis)

- `47bd663` Update README with current system state
- `3d2083b` Add terminology note about organizations vs accounts model
