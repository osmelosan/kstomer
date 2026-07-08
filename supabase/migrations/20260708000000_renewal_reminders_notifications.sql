-- ---------------------------------------------------------------------------
-- reminders: auto-generate J-30/J-7/J rows whenever contacts.renewal_date
-- is set/changed (or the contact is archived/cleared). Matches the intent
-- already documented on the reminders table ("Générés automatiquement quand
-- renewal_date est défini ou modifié.") but never actually wired up.
-- ---------------------------------------------------------------------------
create or replace function public.sync_contact_reminders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.reminders where contact_id = coalesce(new.id, old.id);

  if TG_OP <> 'DELETE' and new.archived_at is null and new.renewal_date is not null then
    insert into public.reminders (contact_id, organization_id, reminder_date, trigger_offset_days, is_active)
    values
      (new.id, new.organization_id, new.renewal_date - interval '30 days', 30, true),
      (new.id, new.organization_id, new.renewal_date - interval '7 days', 7, true),
      (new.id, new.organization_id, new.renewal_date, 0, true);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists contacts_sync_reminders on public.contacts;
create trigger contacts_sync_reminders
after insert or update of renewal_date, archived_at or delete on public.contacts
for each row execute function public.sync_contact_reminders();

-- Backfill: regenerate reminders for every contact that already has a
-- renewal_date, so pre-existing/seed data (some of which is missing rows or
-- out of date) matches what the trigger would have produced.
update public.contacts set renewal_date = renewal_date where renewal_date is not null;

-- ---------------------------------------------------------------------------
-- notifications: real in-app feed backing the notification bell. Rows are
-- only ever inserted by the renewal-reminders cron (service role) — no
-- insert/delete policy for authenticated users.
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'renewal',
  contact_id uuid references public.contacts(id) on delete cascade,
  reminder_id uuid references public.reminders(id) on delete set null,
  trigger_offset_days integer,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'In-app notification feed (bell icon). Populated by the renewal-reminders cron.';

alter table public.notifications enable row level security;

create policy "users read own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "users mark own notifications read" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);
