-- ============================================================================
-- Demo data: "Verdant Bureau" — a second, fully isolated organization owned
-- by the existing test@test.com user, alongside their real "Acme" org.
-- Purpose: prove out multi-tenant data compartmentalization for a live
-- demo/review — every tenant table is scoped by organization_id, enforced
-- by RLS keyed off organizations.owner_id = auth.uid() (see "org owner
-- manages ..." policies in supabase/migrations).
--
-- is_test = true marks this organization as demo/test data. Per the column
-- comment on organizations.is_test, it is meant to be excluded from plan
-- limits and business metrics, and is only ever settable via direct SQL
-- (never through the app's UI/API) — exactly what this script does.
--
-- Reversible: cascading FKs on organization_id (contacts, subscription_details,
-- reminders, etc.) mean the entire demo can be removed with one statement:
--   delete from public.organizations where id = 'eeeeeeee-0000-0000-0000-000000000000';
--
-- Idempotent: every row uses a fixed literal UUID and `on conflict (id) do
-- nothing`, so this file is safe to run more than once.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
insert into public.organizations
  (id, owner_id, name, address, city, postal_code, country, description, is_test, created_at, updated_at)
values
  (
    'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    'Verdant Bureau',
    '14 Rue des Fournitures',
    'Lyon',
    '69002',
    'France',
    'Distributeur B2B de fournitures de bureau et de papeterie professionnelle.',
    true,
    '2026-06-10 09:00:00+00',
    '2026-06-10 09:00:00+00'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- contacts (8 rows spanning all 5 pipeline stages)
-- ---------------------------------------------------------------------------
insert into public.contacts
  (id, organization_id, created_by_user_id, owner_user_id, contact_name, first_name, last_name,
   company_name, email, phone, stage, confidence_level, renewal_date, last_contact_date,
   created_at, updated_at)
values
  (
    'eeeeeeee-0000-0000-0000-0000000000c1', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Élodie Vasseur', 'Élodie', 'Vasseur',
    'Trombone & Associés', 'elodie.vasseur@trombone-associes.fr', '+33 6 12 45 78 90',
    'new_lead', 2, null, null,
    '2026-07-16 09:20:00+00', '2026-07-16 09:20:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c2', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Nicolas Brunet', 'Nicolas', 'Brunet',
    'Rame Blanche SARL', 'nicolas.brunet@rameblanche.fr', '+33 6 23 56 89 01',
    'new_lead', null, null, null,
    '2026-07-14 14:05:00+00', '2026-07-14 14:05:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c3', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Camille Fontaine', 'Camille', 'Fontaine',
    'Agrafix Distribution', 'camille.fontaine@agrafix-distribution.fr', '+33 6 34 67 90 12',
    'contacted', 3, null, '2026-07-15 11:00:00+00',
    '2026-07-08 10:30:00+00', '2026-07-15 11:00:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c4', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Julien Marchand', 'Julien', 'Marchand',
    'Le Comptoir du Classeur', 'julien.marchand@comptoir-classeur.fr', '+33 6 45 78 01 23',
    'proposal', 4, null, '2026-07-13 16:15:00+00',
    '2026-06-30 08:45:00+00', '2026-07-13 16:15:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c5', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Sophie Lambert', 'Sophie', 'Lambert',
    'Encre & Compagnie', 'sophie.lambert@encre-cie.fr', '+33 6 56 89 12 34',
    'at_risk', 2, '2026-08-01 00:00:00+00', '2026-07-11 15:40:00+00',
    '2026-06-20 09:00:00+00', '2026-07-11 15:40:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c6', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Antoine Girard', 'Antoine', 'Girard',
    'Bureau Vertige SAS', 'antoine.girard@bureau-vertige.fr', '+33 6 67 90 23 45',
    'active', 5, '2027-06-25 00:00:00+00', '2026-07-09 10:00:00+00',
    '2026-06-19 09:10:00+00', '2026-07-09 10:00:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c7', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Manon Dubuisson', 'Manon', 'Dubuisson',
    'Stylo Plume Pro', 'manon.dubuisson@styloplumepro.fr', '+33 6 78 01 34 56',
    'active', 4, '2027-06-22 00:00:00+00', '2026-07-05 13:20:00+00',
    '2026-06-18 11:00:00+00', '2026-07-05 13:20:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000c8', 'eeeeeeee-0000-0000-0000-000000000000',
    (select id from auth.users where email = 'test@test.com'),
    (select id from auth.users where email = 'test@test.com'),
    'Thibault Rousseau', 'Thibault', 'Rousseau',
    'Papeterie du Marais', 'thibault.rousseau@papeterie-marais.fr', '+33 6 89 12 45 67',
    'active', 5, '2027-06-20 00:00:00+00', '2026-07-02 09:45:00+00',
    '2026-06-18 08:30:00+00', '2026-07-02 09:45:00+00'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- subscription_details (only for the 3 'active'-stage contacts above,
-- matching the existing Acme precedent of not attaching subscription_details
-- to every stage — only to contacts with an actual deal/subscription)
-- ---------------------------------------------------------------------------
insert into public.subscription_details
  (id, contact_id, organization_id, plan_name, deal_value, mrr, subscription_start_date, updated_at)
values
  (
    'eeeeeeee-0000-0000-0000-0000000000d1', 'eeeeeeee-0000-0000-0000-0000000000c6',
    'eeeeeeee-0000-0000-0000-000000000000',
    'Essentiel', 9600.00, 800.00, '2026-06-25 00:00:00+00', '2026-06-25 00:00:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000d2', 'eeeeeeee-0000-0000-0000-0000000000c7',
    'eeeeeeee-0000-0000-0000-000000000000',
    'Croissance', 43200.00, 3600.00, '2026-06-22 00:00:00+00', '2026-06-22 00:00:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-0000000000d3', 'eeeeeeee-0000-0000-0000-0000000000c8',
    'eeeeeeee-0000-0000-0000-000000000000',
    'Grand Compte', 168000.00, 14000.00, '2026-06-20 00:00:00+00', '2026-06-20 00:00:00+00'
  )
on conflict (id) do nothing;
