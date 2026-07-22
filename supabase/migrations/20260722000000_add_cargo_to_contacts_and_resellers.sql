-- Adds a job title / position field ("cargo") to contacts and resellers,
-- shown and edited from their detail pages alongside company/email/phone.
alter table public.contacts
  add column cargo text;

alter table public.resellers
  add column cargo text;
