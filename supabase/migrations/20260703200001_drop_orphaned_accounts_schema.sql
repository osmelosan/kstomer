-- Drops the accounts/account_members schema now that every table that used
-- to hang off it (contacts, resellers, notes, ...) has been migrated to
-- organizations (see 20260703200000_migrate_crm_tables_to_organizations.sql).
-- Nothing in the application ever wrote to accounts/account_members/
-- notifications, and all three are empty in production.

-- notifications depends on accounts, must go first.
drop policy if exists "notifications_select_members" on public.notifications;
drop table public.notifications;

-- account_members depends on accounts, must go before accounts.
drop policy if exists "account_members_select_members" on public.account_members;
drop policy if exists "account_members_insert_admins" on public.account_members;
drop policy if exists "account_members_update_admins" on public.account_members;
drop policy if exists "account_members_delete_admins" on public.account_members;
drop table public.account_members;

drop policy if exists "accounts_select_members" on public.accounts;
drop policy if exists "accounts_update_admins" on public.accounts;
drop table public.accounts;

-- Helper functions existed solely to power accounts/account_members RLS
-- (has_write_access/is_account_admin/is_account_member all query
-- account_members directly) — every policy that referenced them was
-- dropped/replaced in the previous migration, so they're dead code now.
drop function if exists public.has_write_access(uuid);
drop function if exists public.is_account_admin(uuid);
drop function if exists public.is_account_member(uuid);

drop type if exists public.account_role;
drop type if exists public.notification_type;
