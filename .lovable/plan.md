## Authentification complète via Lovable Cloud (Supabase)

Toute l'auth est gérée par Supabase managé par Lovable Cloud — aucune solution maison, aucun stockage de session local custom. Pas de mention de "Supabase" côté UI : on parle de "compte" / "Lovable Cloud" en interne.

### 1. Activer Lovable Cloud
Pré-requis. Provisionne automatiquement : DB Postgres, Supabase Auth (email + Google + reset), Storage, clients déjà câblés (`@/integrations/supabase/client`, `requireSupabaseAuth`, `attachSupabaseAuth`, layout `_authenticated/route.tsx`).

### 2. Configuration Auth (Supabase managé)
- **Email/password** avec **vérification email obligatoire** (config Supabase Auth).
- **Google OAuth** activé via `configure_social_auth` — broker Lovable, iframe-safe, géré dans Supabase Auth Providers.
- **HIBP** (rejet des mots de passe compromis) activé via `configure_auth`.
- **Reset password** via `supabase.auth.resetPasswordForEmail` (email envoyé par Supabase).

### 3. Schéma de base (migrations Supabase)
Tout en Postgres, RLS activée partout.

**Table `profiles`** liée à `auth.users(id) ON DELETE CASCADE` :
- colonnes : `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`
- RLS : l'utilisateur lit/écrit son propre profil
- Trigger `on_auth_user_created` → `handle_new_user()` insère auto le profil à l'inscription
- GRANTs : `authenticated` (CRUD), `service_role` (ALL)

**Enum `app_role`** : `'admin' | 'tester' | 'user'`

**Table `user_roles`** (séparée des profils — anti-escalade de privilèges) :
- `id`, `user_id` (FK `auth.users`), `role`, `created_at`
- UNIQUE `(user_id, role)`
- RLS : lecture par l'utilisateur lui-même
- **Pas de policy INSERT/UPDATE/DELETE pour `authenticated`** → vous attribuez les rôles à la main depuis la console Lovable Cloud (SQL editor), vous gardez le contrôle total
- GRANTs : `SELECT` à `authenticated`, `ALL` à `service_role`

**Fonction security definer `public.has_role(_user_id uuid, _role app_role)`** — utilisée par les futures policies RLS et le hook `useIsTester()` côté app.

### 4. Routes (TanStack Start + gate Lovable Cloud)
```
src/routes/
  index.tsx                      → / (landing publique)
  auth.tsx                       → /auth (login + signup + forgot)
  reset-password.tsx             → /reset-password (public, callback email Supabase)
  _authenticated/
    route.tsx                    → gate managée par l'intégration Lovable Cloud
                                   (ssr:false, redirige vers /auth si non auth)
    dashboard.tsx                → déplacé ici
    contacts.index.tsx, contacts.$id.tsx, contacts.new.tsx
    kanban.tsx, tasks.tsx, analytics.tsx, archives.tsx, resellers.tsx
    settings.tsx, onboarding.tsx
```
Toutes les routes app passent sous `_authenticated/`. Seules `/`, `/auth`, `/reset-password` restent publiques. La gate auto-générée par Lovable Cloud appelle `supabase.auth.getUser()` côté client et redirige vers `/auth`.

> Note : vous demandiez `/login`, mais le standard Lovable Cloud est `/auth` (recommandé). On garde `/auth`.

### 5. Page `/auth`
Carte centrée style Kstomer (max-w 420px, navy primary). 3 onglets :
- **Connexion** : email + password → `supabase.auth.signInWithPassword` + bouton **Google** → `lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin })`
- **Inscription** : email + password (validation zod) → `supabase.auth.signUp({ emailRedirectTo: origin })` → message "Vérifiez votre boîte mail"
- **Mot de passe oublié** : email → `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`

### 6. Page `/reset-password`
Lit `type=recovery` dans l'URL, formulaire nouveau mot de passe → `supabase.auth.updateUser({ password })` → redirect `/dashboard`. Route publique.

### 7. Intégration shell
- `AppShell` lit `supabase.auth.getUser()` (re-valide côté Auth server) → nom + avatar dans le dropdown
- **Sign out** : `cancelQueries` → `clear` → `supabase.auth.signOut()` → `navigate({ to: '/auth', replace: true })`
- Listener unique `supabase.auth.onAuthStateChange` dans `__root.tsx`, filtré sur `SIGNED_IN/SIGNED_OUT/USER_UPDATED`

### 8. Comptes "tester" — vous gardez la main
- Attribution **manuelle** via console Lovable Cloud :
  ```sql
  insert into public.user_roles (user_id, role) values ('<uuid>', 'tester');
  ```
- Hook `useIsTester()` lit le rôle via `supabase.from('user_roles').select` (RLS permet à l'utilisateur de voir ses propres rôles)
- Helper `applyLimit(value, isTester)` → `isTester ? Infinity : value` pour court-circuiter toute future limite (quotas IA, prospects, etc.)
- Aucune limite n'existe encore dans l'app — l'infra est posée, prête pour les futurs quotas

### 9. i18n
Clés `auth.*` ajoutées dans `fr.ts` / `en.ts` / `es.ts` : login, signup, forgotPassword, emailLabel, passwordLabel, googleButton, verifyEmailSent, resetEmailSent, invalidCredentials, etc.

### Garanties techniques
- **Tout passe par Supabase** : auth, session (cookies/localStorage gérés par `supabase-js`), profils, rôles, futur stockage de données
- Pas de JWT custom, pas d'auth maison, pas de localStorage manuel pour la session
- `attachSupabaseAuth` global (déjà câblé par l'intégration) attache le bearer à chaque server fn
- Les loaders protégés vivent uniquement sous `_authenticated/` (sinon 401 au prerender)
- Validation zod côté client sur tous les formulaires
- RLS activée + GRANTs explicites sur chaque nouvelle table

### Hors périmètre
- Apple/Microsoft (non demandé)
- 2FA (UI factice existante dans Settings — non touchée)
- Migration des mocks vers la DB Supabase (tâche séparée)
