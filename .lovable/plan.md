# Pricing Kstomer + checkout Stripe

Provider : **Stripe (Seamless Payments by Lovable)** — pas de clé API à fournir, sandbox immédiat.
Tax handling : **full compliance handling (`managed_payments`)** par défaut (SaaS digital, pays vendeur éligible). Stripe gère TVA, fraude, disputes, factures, support transactionnel. Modifiable par session ou désactivable plus tard.

## 1. Les trois tiers (remise annuelle -20 %)

| Plan | Mensuel | Annuel (par mois) | Total annuel |
|---|---|---|---|
| **Starter** | 17 €/mois | **13,60 €** | 163,20 €/an |
| **Expansion** ⭐ *Le plus populaire* | 37 €/mois | **29,60 €** | 355,20 €/an |
| **Empire** | 67 €/mois | **53,60 €** | 643,20 €/an |

**Essai gratuit 14 jours** sur les 3 plans (`trial_period_days: 14` au niveau des prix Stripe).
**Expansion en surbrillance** : badge "Le plus populaire", scale 1.05, bordure 2px Secondary Blue, ombre prononcée, CTA Deep Navy plein.

### Features incrémentales

**Starter — 17 € / 13,60 €**
- 1 utilisateur, 1 société / contexte
- Contacts illimités
- Pipeline kanban (1 pipeline)
- Tâches & rappels
- Dashboard IA (résumé hebdo)
- Support email

**Expansion — 37 € / 29,60 € — *Le plus populaire***
*Tout Starter +*
- Multi-contextes / multi-sociétés (jusqu'à 5)
- Pipelines multiples (jusqu'à 5)
- Export reporting (CSV / PDF, planifiable)
- Notes versionnées + historique étendu
- Intégrations email (IMAP/SMTP)
- Modèles d'emails IA
- Support prioritaire

**Empire — 67 € / 53,60 €**
*Tout Expansion +*
- Jusqu'à 5 sièges utilisateurs
- Contextes & pipelines illimités
- Vues manager (consolidation équipe, perf par membre)
- Alertes deals (froid/chaud, renouvellement 30j, montant > seuil)
- Permissions par rôle
- API & webhooks
- Onboarding personnalisé

## 2. Architecture technique

### Base de données (1 migration)
- `plans` (seed 3 plans + features JSON, flag `is_featured` sur Expansion) — lecture publique via `TO anon SELECT`.
- `subscriptions` (`user_id`, `plan_code`, `billing_interval`, `status`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `trial_end`, `cancel_at_period_end`) — RLS : user lit la sienne, service_role écrit.
- `billing_events` (audit webhooks Stripe, `event_id UNIQUE` pour idempotence) — service_role seul.
- Fonction `has_active_subscription(_user_id)` (SECURITY DEFINER) pour gating.
- Le flag `is_test_account` continue de contourner les limites.

### Stripe
- Activation via `enable_stripe_payments` → environnement test immédiat (aucune clé à fournir).
- 3 produits × 2 prix (mensuel / annuel) = **6 prix Stripe** créés via `batch_create_product`, avec `trial_period_days: 14` et `tax_code` SaaS (`txcd_10000000`) sur chaque produit.

### Server functions (TanStack `createServerFn`)
- `createCheckoutSession` (auth requise via `requireSupabaseAuth`) → crée une Checkout Session Stripe en mode `subscription` avec `managed_payments: { enabled: true }`, `subscription_data.trial_period_days: 14`, retourne `url`.
- `openCustomerPortal` → URL du Stripe Billing Portal (changer/annuler le plan, MAJ moyen de paiement, factures).
- `getCurrentSubscription` → souscription courante + jours d'essai restants.

### Webhook Stripe
- Route publique `src/routes/api/public/stripe-webhook.ts`.
- Vérification de signature Stripe (`stripe.webhooks.constructEvent` avec `STRIPE_WEBHOOK_SECRET`, body brut).
- Traite : `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`.
- Met à jour `subscriptions` via `supabaseAdmin` (import dynamique dans le handler), idempotent via `billing_events.event_id UNIQUE`.

### UI
- **Page publique `/pricing`** : 3 cartes, toggle Mensuel / Annuel (badge "Économisez 20 %"), liste de features, CTA "Commencer l'essai gratuit" → `/auth` si non connecté → Checkout Stripe hébergé. Expansion en surbrillance (badge pill Secondary Blue, scale 1.05, bordure 2px, ombre prononcée, CTA plein Deep Navy).
- **Settings → Billing** (refonte) : plan en cours, jours d'essai restants, prochain prélèvement, "Gérer mon abonnement" (Billing Portal), "Changer de plan".
- **Bandeau AppShell** quand `trial_end - now < 3 jours`.
- Tokens design respectés, i18n FR / EN / ES.

## 3. Tester avant la mise en ligne

Environnement **test Stripe** actif dès l'activation :
1. `/pricing` → choisir plan + intervalle → Checkout Stripe.
2. Carte test `4242 4242 4242 4242`, CVC `123`, expiration future.
3. Vérifier Settings → Billing (essai 14j, date de prélèvement).
4. Tester annulation + changement de plan via le Billing Portal.
5. Vérifier les webhooks : succès, `4000 0000 0000 9995` (échec paiement), `4000 0025 0000 3155` (3DS), annulation — entrées dans `billing_events`.

**Passage en live** : bouton dédié dans la config Stripe Lovable (KYB / IBAN requis). Aucun changement de code, les 6 prix sont répliqués automatiquement vers le mode live.

## Ordre d'exécution (mode build)

1. Migration SQL (`plans`, `subscriptions`, `billing_events`, `has_active_subscription`).
2. `enable_stripe_payments`.
3. Création des 6 prix Stripe (3 plans × mensuel/annuel, trial 14j, `tax_code` SaaS).
4. Server functions + webhook signé.
5. UI `/pricing` (Expansion en surbrillance), refonte Settings → Billing, bandeau trial.
6. Validation manuelle en sandbox avec cartes test.