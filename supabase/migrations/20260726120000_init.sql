-- LaborLink phase 1 schema.
-- Every table: RLS enabled, default deny, policies per operation.
-- Data classes per column are noted (P0 restricted / P1 personal / P2 operational).

-- Helper functions are declared before the tables they reference.
set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('student', 'employer');
create type public.listing_type as enum ('werkstudent', 'minijob', 'kurzfristig');
create type public.listing_status as enum ('draft', 'active', 'closed');
create type public.application_status as enum
  ('submitted', 'in_review', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
-- Work authorization is self-declared in phase 1. Document verification
-- (private bucket + review) upgrades it later. Employers only ever see a
-- derived boolean — never the underlying detail (SECURITY.md).
create type public.work_auth_status as enum
  ('eu_citizen', 'permit_verified', 'permit_pending', 'unknown');

-- ---------------------------------------------------------------------------
-- Helper functions live in a private schema, SECURITY DEFINER with pinned
-- search_path, so policies can check memberships without RLS recursion.
-- ---------------------------------------------------------------------------

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user. Role is permanent (no update policy).
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,                -- P1
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

-- No insert policy: rows are created by the auth trigger below.
-- No update policy: the role choice is permanent.
-- No delete policy: rows die with the auth user (cascade).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r text;
begin
  r := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'student');
  if r not in ('student', 'employer') then
    r := 'student';
  end if;
  insert into public.profiles (id, role)
  values (new.id, r::public.user_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function private.has_role(r public.user_role)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = r
  );
$$;

-- ---------------------------------------------------------------------------
-- student_profiles — P1. Owner-only. Employers never read this table;
-- they receive a consented snapshot on the application instead.
-- ---------------------------------------------------------------------------

create table public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  first_name text not null default '',            -- P1
  last_name text not null default '',             -- P1
  city text,                                      -- P1
  university text,                                -- P1
  degree_program text,                            -- P1
  semester smallint check (semester between 1 and 30),
  languages text[] not null default '{}',         -- P1
  bio text,                                       -- P1
  work_auth public.work_auth_status not null default 'unknown',  -- P0-adjacent
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

create policy "student_profiles_select_own"
  on public.student_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "student_profiles_insert_own"
  on public.student_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and private.has_role('student'));

create policy "student_profiles_update_own"
  on public.student_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "student_profiles_delete_own"
  on public.student_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- employers — P2 public company profiles.
-- ---------------------------------------------------------------------------

create table public.employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  website text,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.employers enable row level security;

create or replace function private.is_employer_member(emp uuid)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.employer_members m
    where m.employer_id = emp and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_employer_owner(emp uuid)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.employer_members m
    where m.employer_id = emp
      and m.user_id = (select auth.uid())
      and m.member_role = 'owner'
  );
$$;

create policy "employers_select_public"
  on public.employers for select to anon, authenticated
  using (true);  -- P2: public company pages

create policy "employers_insert_employer_role"
  on public.employers for insert to authenticated
  with check (created_by = (select auth.uid()) and private.has_role('employer'));

create policy "employers_update_owner"
  on public.employers for update to authenticated
  using (private.is_employer_owner(id))
  with check (private.is_employer_owner(id));

create policy "employers_delete_owner"
  on public.employers for delete to authenticated
  using (private.is_employer_owner(id));

-- ---------------------------------------------------------------------------
-- employer_members — team membership. P1.
-- ---------------------------------------------------------------------------

create table public.employer_members (
  employer_id uuid not null references public.employers (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (employer_id, user_id)
);

alter table public.employer_members enable row level security;

create policy "employer_members_select_same_team"
  on public.employer_members for select to authenticated
  using (user_id = (select auth.uid()) or private.is_employer_member(employer_id));

-- Bootstrap: the creator of an employer may add themself as owner.
-- After that, only owners add members.
create policy "employer_members_insert"
  on public.employer_members for insert to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and member_role = 'owner'
      and exists (
        select 1 from public.employers e
        where e.id = employer_id and e.created_by = (select auth.uid())
      )
    )
    or private.is_employer_owner(employer_id)
  );

create policy "employer_members_update_owner"
  on public.employer_members for update to authenticated
  using (private.is_employer_owner(employer_id))
  with check (private.is_employer_owner(employer_id));

create policy "employer_members_delete"
  on public.employer_members for delete to authenticated
  using (user_id = (select auth.uid()) or private.is_employer_owner(employer_id));

-- ---------------------------------------------------------------------------
-- listings — P2 when active, private to the team otherwise.
-- ---------------------------------------------------------------------------

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers (id) on delete cascade,
  title text not null,
  slug text not null unique,
  type public.listing_type not null,
  description text not null default '',
  city text,
  remote boolean not null default false,
  hourly_wage_cents integer not null check (hourly_wage_cents >= 0),
  hours_per_week numeric(4, 1) not null check (hours_per_week > 0 and hours_per_week <= 48),
  status public.listing_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_active_idx on public.listings (status, published_at desc);
create index listings_employer_idx on public.listings (employer_id);
create index listings_city_idx on public.listings (city);
create index listings_type_idx on public.listings (type);

alter table public.listings enable row level security;

create policy "listings_select_active_public"
  on public.listings for select to anon, authenticated
  using (status = 'active');

create policy "listings_select_team"
  on public.listings for select to authenticated
  using (private.is_employer_member(employer_id));

create policy "listings_insert_team"
  on public.listings for insert to authenticated
  with check (private.is_employer_member(employer_id));

create policy "listings_update_team"
  on public.listings for update to authenticated
  using (private.is_employer_member(employer_id))
  with check (private.is_employer_member(employer_id));

create policy "listings_delete_owner"
  on public.listings for delete to authenticated
  using (private.is_employer_owner(employer_id));

-- ---------------------------------------------------------------------------
-- applications — P1. The snapshot holds only the fields the student
-- consented to share for THIS application, written server-side at apply
-- time. Employers read the snapshot, never the live student profile.
-- ---------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.application_status not null default 'submitted',
  message text,                                   -- P1, student-authored
  snapshot jsonb not null default '{}'::jsonb,    -- P1, consented fields only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, student_id)
);

create index applications_listing_idx on public.applications (listing_id);
create index applications_student_idx on public.applications (student_id);

alter table public.applications enable row level security;

create or replace function private.manages_listing(l uuid)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.listings li
    join public.employer_members m on m.employer_id = li.employer_id
    where li.id = l and m.user_id = (select auth.uid())
  );
$$;

create policy "applications_select_own_student"
  on public.applications for select to authenticated
  using (student_id = (select auth.uid()));

create policy "applications_select_listing_team"
  on public.applications for select to authenticated
  using (private.manages_listing(listing_id));

create policy "applications_insert_student"
  on public.applications for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and private.has_role('student')
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active'
    )
  );

-- Students may only withdraw. Employers move status through the pipeline.
create policy "applications_update_student_withdraw"
  on public.applications for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()) and status = 'withdrawn');

create policy "applications_update_listing_team"
  on public.applications for update to authenticated
  using (private.manages_listing(listing_id))
  with check (
    private.manages_listing(listing_id)
    and status in ('submitted', 'in_review', 'interview', 'offer', 'hired', 'rejected')
  );

-- No delete policy: applications are an audit trail.

-- Immutable columns: neither side may rewrite who applied where, nor the
-- consented snapshot.
create or replace function public.applications_protect_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.listing_id is distinct from old.listing_id
     or new.student_id is distinct from old.student_id
     or new.snapshot is distinct from old.snapshot
     or new.created_at is distinct from old.created_at then
    raise exception 'listing_id, student_id, snapshot and created_at are immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger applications_protect_columns
  before update on public.applications
  for each row execute function public.applications_protect_columns();

-- ---------------------------------------------------------------------------
-- hour_entries — P1. Owner-only in phase 1.
-- ---------------------------------------------------------------------------

create table public.hour_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  worked_on date not null,
  hours numeric(4, 2) not null check (hours > 0 and hours <= 24),
  note text,                                      -- P1
  created_at timestamptz not null default now()
);

create index hour_entries_student_week_idx on public.hour_entries (student_id, worked_on desc);

alter table public.hour_entries enable row level security;

create policy "hour_entries_select_own"
  on public.hour_entries for select to authenticated
  using (student_id = (select auth.uid()));

create policy "hour_entries_insert_own"
  on public.hour_entries for insert to authenticated
  with check (student_id = (select auth.uid()) and private.has_role('student'));

create policy "hour_entries_update_own"
  on public.hour_entries for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy "hour_entries_delete_own"
  on public.hour_entries for delete to authenticated
  using (student_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- documents — P0. Metadata for files in the private "documents" bucket.
-- Owner-only, no employer path at all. Employers get a derived boolean
-- (student_profiles.work_auth → snapshot), never the document.
-- ---------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('residence_permit', 'enrollment_certificate', 'other')),
  storage_path text not null unique,              -- P0: randomized, never guessable
  original_name text not null,                    -- P1
  uploaded_at timestamptz not null default now(),
  expires_on date
);

create index documents_student_idx on public.documents (student_id);

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select to authenticated
  using (student_id = (select auth.uid()));

create policy "documents_insert_own"
  on public.documents for insert to authenticated
  with check (student_id = (select auth.uid()) and private.has_role('student'));

create policy "documents_update_own"
  on public.documents for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy "documents_delete_own"
  on public.documents for delete to authenticated
  using (student_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- subscriptions — entitlements, written only by the Stripe webhook using
-- the service role (bypasses RLS). No client-side write path exists.
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  employer_id uuid primary key references public.employers (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null default 'free' check (tier in ('free', 'starter', 'growth')),
  status text not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_team"
  on public.subscriptions for select to authenticated
  using (private.is_employer_member(employer_id));

-- No insert/update/delete policies: service-role webhook only.

-- ---------------------------------------------------------------------------
-- Storage: private bucket for P0 documents. Paths are
-- {user_id}/{random}.{ext}; access via short-TTL signed URLs, server-side.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "documents_bucket_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "documents_bucket_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "documents_bucket_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "documents_bucket_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
