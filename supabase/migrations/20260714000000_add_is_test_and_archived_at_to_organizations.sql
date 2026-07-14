alter table public.organizations
  add column is_test boolean not null default false,
  add column archived_at timestamptz;

comment on column public.organizations.is_test is 'Comptes de test/démo, exclus des limites de plan et des métriques business. Modifiable uniquement via SQL/administration (aucune UI ni API).';
comment on column public.organizations.archived_at is 'Archivage RGPD au niveau compte : non null = compte archivé, conservé 12 mois avant suppression définitive.';
