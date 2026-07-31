-- Payment tracking. NOT a payment rail.
--
-- No money moves through LaborLink and no bank details are stored. Holding
-- or transmitting wages is a regulated activity, and a Werkstudent wage is
-- payroll — the employer must withhold wage tax and remit social security
-- contributions before the net reaches the student. Moving gross money
-- would look like compliance while discharging none of it.
--
-- What this table records is that a payment was made outside the platform,
-- so a student can see whether the hours they worked were actually paid.
-- The amount is GROSS: hours confirmed by the employer x the listing rate.
-- Deductions are the employer's payroll responsibility and are not modelled.
--
-- Rows exist only for periods that were paid. An unpaid period is the
-- absence of a row, derived from confirmed hours at read time, so nothing
-- has to be pre-generated or kept in sync.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  -- Always the first day of the month the work falls in.
  period_start date not null,
  -- Snapshots taken when the payment was recorded: the rate on a listing
  -- can change later, and this must stay a record of what was actually paid.
  confirmed_hours numeric(6, 2) not null check (confirmed_hours >= 0),
  hourly_wage_cents integer not null check (hourly_wage_cents >= 0),
  gross_cents integer not null check (gross_cents >= 0),
  paid_on date not null,
  reference text,                                  -- P1: employer's transfer reference
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, listing_id, period_start)
);

create index payments_employer_idx on public.payments (employer_id, period_start desc);
create index payments_student_idx on public.payments (student_id, period_start desc);

alter table public.payments enable row level security;

-- The student sees their own payment history and nothing else.
create policy "payments_select_own_student"
  on public.payments for select to authenticated
  using (student_id = (select auth.uid()));

-- The employing employer sees and records payments for their own listing.
create policy "payments_select_employer"
  on public.payments for select to authenticated
  using (private.employs_student_for_listing(listing_id, student_id));

create policy "payments_insert_employer"
  on public.payments for insert to authenticated
  with check (private.employs_student_for_listing(listing_id, student_id));

create policy "payments_update_employer"
  on public.payments for update to authenticated
  using (private.employs_student_for_listing(listing_id, student_id))
  with check (private.employs_student_for_listing(listing_id, student_id));

create policy "payments_delete_employer"
  on public.payments for delete to authenticated
  using (private.employs_student_for_listing(listing_id, student_id));

grant select, insert, update, delete on public.payments to authenticated;

-- A student must never be able to mark themselves paid, and the period is
-- always normalised to the first of the month so the unique key holds.
create or replace function public.payments_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'student'
  ) then
    raise exception 'only the employer can record a payment';
  end if;

  new.period_start := date_trunc('month', new.period_start)::date;

  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  else
    new.student_id := old.student_id;
    new.listing_id := old.listing_id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger payments_guard
  before insert or update on public.payments
  for each row execute function public.payments_guard();
