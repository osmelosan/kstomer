-- Migrates the CRM tables (contacts, resellers, and everything hanging off them)
-- from the old accounts/account_members ownership model to the organizations
-- model that the live app actually uses (Settings > Company, the company
-- switcher). All of these tables are empty in production, so this is a pure
-- schema change with no data to migrate or backfill.

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
drop policy if exists "contacts_select_members" on public.contacts;
drop policy if exists "contacts_insert_write_access" on public.contacts;
drop policy if exists "contacts_update_write_access" on public.contacts;

alter table public.contacts rename column account_id to organization_id;
alter table public.contacts drop constraint contacts_account_id_fkey;
alter table public.contacts
  add constraint contacts_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;
alter table public.contacts
  add constraint contacts_organization_id_email_key unique (organization_id, email);

create policy "org owner manages contacts" on public.contacts for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- resellers
-- ---------------------------------------------------------------------------
drop policy if exists "resellers_select_members" on public.resellers;
drop policy if exists "resellers_insert_write_access" on public.resellers;
drop policy if exists "resellers_update_write_access" on public.resellers;

alter table public.resellers rename column account_id to organization_id;
alter table public.resellers drop constraint resellers_account_id_fkey;
alter table public.resellers
  add constraint resellers_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages resellers" on public.resellers for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- subscription_details
-- ---------------------------------------------------------------------------
drop policy if exists "subscription_details_select_members" on public.subscription_details;
drop policy if exists "subscription_details_insert_write_access" on public.subscription_details;
drop policy if exists "subscription_details_update_write_access" on public.subscription_details;

alter table public.subscription_details rename column account_id to organization_id;
alter table public.subscription_details drop constraint subscription_details_account_id_fkey;
alter table public.subscription_details
  add constraint subscription_details_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages subscription_details" on public.subscription_details for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
drop policy if exists "notes_select_members" on public.notes;
drop policy if exists "notes_insert_write_access" on public.notes;
drop policy if exists "notes_update_write_access" on public.notes;

alter table public.notes rename column account_id to organization_id;
alter table public.notes drop constraint notes_account_id_fkey;
alter table public.notes
  add constraint notes_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages notes" on public.notes for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- note_edit_history (no account_id/organization_id of its own — scoped via notes)
-- ---------------------------------------------------------------------------
drop policy if exists "note_edit_history_select_members" on public.note_edit_history;
drop policy if exists "note_edit_history_insert_write_access" on public.note_edit_history;

create policy "org owner manages note_edit_history" on public.note_edit_history for all
  using (exists (
    select 1 from public.notes n
    join public.organizations o on o.id = n.organization_id
    where n.id = note_edit_history.note_id and o.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.notes n
    join public.organizations o on o.id = n.organization_id
    where n.id = note_edit_history.note_id and o.owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
drop policy if exists "reminders_select_members" on public.reminders;
drop policy if exists "reminders_update_write_access" on public.reminders;

alter table public.reminders rename column account_id to organization_id;
alter table public.reminders drop constraint reminders_account_id_fkey;
alter table public.reminders
  add constraint reminders_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages reminders" on public.reminders for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- stage_history
-- ---------------------------------------------------------------------------
drop policy if exists "stage_history_select_members" on public.stage_history;
drop policy if exists "stage_history_insert_write_access" on public.stage_history;

alter table public.stage_history rename column account_id to organization_id;
alter table public.stage_history drop constraint stage_history_account_id_fkey;
alter table public.stage_history
  add constraint stage_history_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages stage_history" on public.stage_history for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_insights
-- ---------------------------------------------------------------------------
drop policy if exists "ai_insights_select_members" on public.ai_insights;

alter table public.ai_insights rename column account_id to organization_id;
alter table public.ai_insights drop constraint ai_insights_account_id_fkey;
alter table public.ai_insights
  add constraint ai_insights_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages ai_insights" on public.ai_insights for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_prompt_cache
-- ---------------------------------------------------------------------------
drop policy if exists "ai_prompt_cache_select_members" on public.ai_prompt_cache;

alter table public.ai_prompt_cache rename column account_id to organization_id;
alter table public.ai_prompt_cache drop constraint ai_prompt_cache_account_id_fkey;
alter table public.ai_prompt_cache
  add constraint ai_prompt_cache_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages ai_prompt_cache" on public.ai_prompt_cache for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- reseller_contacts
-- ---------------------------------------------------------------------------
drop policy if exists "reseller_contacts_select_members" on public.reseller_contacts;
drop policy if exists "reseller_contacts_insert_write_access" on public.reseller_contacts;
drop policy if exists "reseller_contacts_update_write_access" on public.reseller_contacts;
drop policy if exists "reseller_contacts_delete_write_access" on public.reseller_contacts;

alter table public.reseller_contacts rename column account_id to organization_id;
alter table public.reseller_contacts drop constraint reseller_contacts_account_id_fkey;
alter table public.reseller_contacts
  add constraint reseller_contacts_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages reseller_contacts" on public.reseller_contacts for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- reseller_contact_history
-- ---------------------------------------------------------------------------
drop policy if exists "reseller_contact_history_select_members" on public.reseller_contact_history;
drop policy if exists "reseller_contact_history_insert_write_access" on public.reseller_contact_history;
drop policy if exists "reseller_contact_history_update_write_access" on public.reseller_contact_history;

alter table public.reseller_contact_history rename column account_id to organization_id;
alter table public.reseller_contact_history drop constraint reseller_contact_history_account_id_fkey;
alter table public.reseller_contact_history
  add constraint reseller_contact_history_organization_id_fkey
  foreign key (organization_id) references public.organizations(id) on delete cascade;

create policy "org owner manages reseller_contact_history" on public.reseller_contact_history for all
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));
