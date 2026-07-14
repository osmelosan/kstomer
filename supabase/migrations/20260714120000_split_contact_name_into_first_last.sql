-- Adds first_name/last_name to contacts so the contact detail page and the
-- CSV import can capture them separately, instead of one free-text name
-- field. contact_name stays as the single source of truth used everywhere
-- else in the app (lists, kanban, notifications, AI tools) and is kept in
-- sync from first_name/last_name wherever those are edited.
alter table public.contacts
  add column first_name text,
  add column last_name text;

update public.contacts
set
  first_name = coalesce(nullif(split_part(trim(contact_name), ' ', 1), ''), contact_name),
  last_name = nullif(trim(regexp_replace(trim(contact_name), '^\S+\s*', '')), '');

alter table public.contacts
  alter column first_name set not null;
