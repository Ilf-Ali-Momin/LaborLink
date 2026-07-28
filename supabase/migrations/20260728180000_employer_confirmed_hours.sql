-- Employer-confirmed hours.
--
-- Why hours stay student-writable: the 20 h/week Werkstudent limit applies
-- across ALL of a student's jobs together (§ 6 Abs. 1 Nr. 3 SGB V). An
-- employer only ever sees their own hours, so an employer-only ledger
-- cannot compute the legal total and would silently under-report it —
-- telling a student they are compliant when they are not. The student
-- therefore keeps the complete picture; the employer gets authority over
-- the record for their own job.
--
-- Provenance is explicit: an entry is self_reported until the employer
-- confirms it, and a corrected entry keeps the student's original figure
-- so a later dispute has a history rather than one side's word.

create type public.hour_entry_status as enum
  ('self_reported', 'confirmed', 'corrected');

alter table public.hour_entries
  -- Null means "an employer not on LaborLink". Those hours still count
  -- toward the legal limit, so they must remain recordable.
  add column listing_id uuid references public.listings (id) on delete set null,
  add column status public.hour_entry_status not null default 'self_reported',
  -- The student's original figure, never overwritten by a correction.
  add column submitted_hours numeric(4, 2),
  add column confirmed_by uuid references public.profiles (id) on delete set null,
  add column confirmed_at timestamptz,
  add column employer_note text;

update public.hour_entries set submitted_hours = hours where submitted_hours is null;

create index hour_entries_listing_idx on public.hour_entries (listing_id);
create index hour_entries_status_idx on public.hour_entries (status);

-- ---------------------------------------------------------------------------
-- Does the current user's employer actually employ this student for this
-- listing? Only a hired application creates that relationship — otherwise a
-- student could push entries into any employer's queue.
-- ---------------------------------------------------------------------------

create or replace function private.employs_student_for_listing(l uuid, s uuid)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    join public.listings li on li.id = a.listing_id
    join public.employer_members m on m.employer_id = li.employer_id
    where a.listing_id = l
      and a.student_id = s
      and a.status = 'hired'
      and m.user_id = (select auth.uid())
  );
$$;

grant execute on function private.employs_student_for_listing(uuid, uuid)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Policies. The student's existing owner-only policies are replaced so that
-- a confirmed entry becomes read-only to them.
-- ---------------------------------------------------------------------------

drop policy if exists "hour_entries_update_own" on public.hour_entries;
drop policy if exists "hour_entries_delete_own" on public.hour_entries;

-- A student may revise or remove an entry only while it is still their own
-- unconfirmed claim.
create policy "hour_entries_update_own_unconfirmed"
  on public.hour_entries for update to authenticated
  using (student_id = (select auth.uid()) and status = 'self_reported')
  with check (student_id = (select auth.uid()) and status = 'self_reported');

create policy "hour_entries_delete_own_unconfirmed"
  on public.hour_entries for delete to authenticated
  using (student_id = (select auth.uid()) and status = 'self_reported');

-- The employing employer sees and rules on hours for their own listing.
create policy "hour_entries_select_employer"
  on public.hour_entries for select to authenticated
  using (
    listing_id is not null
    and private.employs_student_for_listing(listing_id, student_id)
  );

create policy "hour_entries_update_employer"
  on public.hour_entries for update to authenticated
  using (
    listing_id is not null
    and private.employs_student_for_listing(listing_id, student_id)
  )
  with check (
    listing_id is not null
    and private.employs_student_for_listing(listing_id, student_id)
  );

-- No employer delete policy: an employer disputes a figure by correcting it,
-- never by erasing the student's claim.

-- ---------------------------------------------------------------------------
-- Integrity rules RLS cannot express.
-- ---------------------------------------------------------------------------

create or replace function public.hour_entries_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Only the student originates an entry, and never pre-confirmed.
    new.status := 'self_reported';
    new.submitted_hours := new.hours;
    new.confirmed_by := null;
    new.confirmed_at := null;
    -- Hours may only be attributed to a listing the student was hired for.
    if new.listing_id is not null
       and not exists (
         select 1 from public.applications a
         where a.listing_id = new.listing_id
           and a.student_id = new.student_id
           and a.status = 'hired'
       ) then
      raise exception 'hours can only be logged against a job you were hired for';
    end if;
    return new;
  end if;

  -- The student's original claim is immutable evidence.
  new.submitted_hours := old.submitted_hours;
  new.student_id := old.student_id;
  new.created_at := old.created_at;

  -- Students cannot confirm their own hours. RLS already limits them to
  -- self_reported rows; this stops them promoting a row on the way out.
  if (select auth.uid()) = old.student_id then
    new.status := 'self_reported';
    new.confirmed_by := old.confirmed_by;
    new.confirmed_at := old.confirmed_at;
    new.listing_id := old.listing_id;
  else
    -- Employer action: stamp who and when, and mark a changed figure as a
    -- correction rather than a plain confirmation.
    new.confirmed_by := (select auth.uid());
    new.confirmed_at := now();
    new.status := case
      when new.hours is distinct from old.submitted_hours then 'corrected'
      else 'confirmed'
    end;
  end if;

  return new;
end;
$$;

create trigger hour_entries_guard
  before insert or update on public.hour_entries
  for each row execute function public.hour_entries_guard();
