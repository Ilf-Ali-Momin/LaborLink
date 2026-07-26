-- Table-level privileges (coarse layer). RLS policies remain the row-level
-- boundary; these grants are deliberately least-privilege per role.

grant usage on schema public to anon, authenticated;

-- Anonymous visitors read public marketplace data only.
grant select on public.employers, public.listings to anon;

-- Authenticated users: per-table, per-operation. RLS narrows rows.
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
