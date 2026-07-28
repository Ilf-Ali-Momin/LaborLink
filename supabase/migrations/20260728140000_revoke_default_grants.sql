-- Default-deny at the privilege layer, not just the RLS layer.
--
-- Why this exists: a Supabase project carries default privileges that grant
-- anon/authenticated broad access to every new table in `public`. The local
-- CLI stack does not. Our earlier grants migration only ADDED grants, so the
-- two environments diverged: locally anon is refused outright on protected
-- tables, while in production anon reaches them and is stopped only by RLS.
--
-- RLS is still the row boundary and it is enabled everywhere, so this is not
-- an open door. But SECURITY.md requires default deny, and a divergence like
-- this is exactly how a future table ships protected locally and exposed in
-- production. This migration makes production match local.

-- 1. Strip everything from the two public-facing roles.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- 2. Stop future tables from inheriting broad access. Applied for both the
--    owner role and the migration role, since either may create objects.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges in schema public
  revoke all on functions from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;

-- 3. Re-grant the narrow set the application actually needs. This mirrors
--    20260726121000_grants.sql exactly; RLS narrows rows within these.
grant usage on schema public to anon, authenticated;

-- Anonymous visitors read public marketplace data only.
grant select on public.employers, public.listings to anon;

-- Authenticated users: per-table, per-operation.
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.employers to authenticated;
grant select, insert, update, delete on public.employer_members to authenticated;
grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, insert, update, delete on public.hour_entries to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select on public.subscriptions to authenticated;

-- Policy helper functions run as the querying role.
grant usage on schema private to anon, authenticated;
grant execute on all functions in schema private to anon, authenticated;
