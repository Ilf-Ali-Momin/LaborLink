-- ============================================================
-- LaborLink schema + Row Level Security
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL).
-- Written against SECURITY.md section 1:
--   * RLS ENABLED on every table, no exceptions
--   * explicit policies per action (no FOR ALL, no USING (true))
--   * rows scoped to their owner via auth.uid()
--   * student/employer role separation enforced IN POLICY
--   * security definer functions validate the caller and lock search_path
--   * clients never touch service_role; everything here works with anon + RLS
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- One row per auth user. role stays NULL until onboarding picks it.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  role text check (role in ('student', 'employer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Marketplace listings. owner_id NULL = platform seeded job.
-- verified is platform managed (see protect_job_verified trigger).
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  employer_name text not null check (char_length(employer_name) between 2 and 120),
  city text not null check (char_length(city) between 2 and 120),
  -- German statutory minimum wage 2026. Server side enforcement of the
  -- same rule the UI checks (SECURITY.md 3.1: never client side only).
  pay_eur numeric(6, 2) not null check (pay_eur >= 13.90),
  hours_per_week text not null check (char_length(hours_per_week) between 1 and 40),
  job_type text not null check (job_type in ('minijob', 'werkstudent', 'oneoff')),
  description text not null default '' check (char_length(description) <= 4000),
  tasks text[] not null default '{}',
  verified boolean not null default false,
  status text not null default 'live' check (status in ('live', 'closed')),
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(message) between 20 and 2000),
  hours_per_week int not null check (hours_per_week between 1 and 20),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (job_id, student_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

-- System generated notifications (triggers below). Clients can only
-- read their own and mark them read; they can never insert.
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('compliance', 'proposal', 'match', 'contract')),
  title text not null check (char_length(title) <= 200),
  body text not null check (char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index jobs_owner_idx on public.jobs (owner_id);
create index jobs_status_idx on public.jobs (status, created_at desc);
create index proposals_job_idx on public.proposals (job_id);
create index proposals_student_idx on public.proposals (student_id);
create index participants_profile_idx on public.conversation_participants (profile_id);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index alerts_profile_idx on public.alerts (profile_id, created_at desc);

-- ------------------------------------------------------------
-- 2. HELPER FUNCTIONS (security definer, caller validated,
--    search_path locked per SECURITY.md 1.2)
-- ------------------------------------------------------------

-- Avoids recursive RLS when policies on participant scoped tables
-- need to ask "am I in this conversation?".
create or replace function public.is_participant(conv uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conv and cp.profile_id = auth.uid()
  );
$$;

create or replace function public.shares_conversation(other uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversation_participants mine
    join conversation_participants theirs
      on theirs.conversation_id = mine.conversation_id
    where mine.profile_id = auth.uid() and theirs.profile_id = other
  );
$$;

-- True when the caller and `other` are linked through a proposal
-- (student applied to the employer's job), in either direction.
create or replace function public.shares_proposal(other uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from proposals pr
    join jobs j on j.id = pr.job_id
    where (pr.student_id = auth.uid() and j.owner_id = other)
       or (pr.student_id = other and j.owner_id = auth.uid())
  );
$$;

revoke all on function public.is_participant(uuid) from public, anon;
revoke all on function public.shares_conversation(uuid) from public, anon;
revoke all on function public.shares_proposal(uuid) from public, anon;
grant execute on function public.is_participant(uuid) to authenticated;
grant execute on function public.shares_conversation(uuid) to authenticated;
grant execute on function public.shares_proposal(uuid) to authenticated;

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY: enabled on EVERY table
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.proposals enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.alerts enable row level security;

-- profiles ----------------------------------------------------
-- You see yourself, people you share a proposal relationship with
-- (an employer must see applicants), and conversation partners.
create policy "profiles select own or related"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.shares_proposal(id)
    or public.shares_conversation(id)
  );

create policy "profiles insert self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles update self"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No delete policy: erasure goes through delete_my_data() below,
-- account removal is a platform action.

-- jobs --------------------------------------------------------
create policy "jobs select live or own"
  on public.jobs for select to authenticated
  using (status = 'live' or owner_id = auth.uid());

-- Role separation IN POLICY: only employers can post, only as
-- themselves, never pre verified (SECURITY.md 1.1).
create policy "jobs insert employers only"
  on public.jobs for insert to authenticated
  with check (
    owner_id = auth.uid()
    and verified = false
    and status = 'live'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'employer'
    )
  );

create policy "jobs update own"
  on public.jobs for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "jobs delete own"
  on public.jobs for delete to authenticated
  using (owner_id = auth.uid());

-- proposals ---------------------------------------------------
-- Student sees own; employer sees proposals to their own jobs and
-- never another employer's applicant list (SECURITY.md 1.1).
create policy "proposals select own or received"
  on public.proposals for select to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.owner_id = auth.uid()
    )
  );

create policy "proposals insert students only"
  on public.proposals for insert to authenticated
  with check (
    student_id = auth.uid()
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'student'
    )
    and exists (
      select 1 from public.jobs j
      where j.id = job_id and j.status = 'live'
    )
  );

-- Students may only withdraw their own proposal.
create policy "proposals update withdraw own"
  on public.proposals for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid() and status = 'withdrawn');

-- Employers may only decide proposals on their own jobs.
create policy "proposals update decide received"
  on public.proposals for update to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and j.owner_id = auth.uid()
    )
  )
  with check (
    status in ('accepted', 'declined')
    and exists (
      select 1 from public.jobs j
      where j.id = job_id and j.owner_id = auth.uid()
    )
  );

create policy "proposals delete own"
  on public.proposals for delete to authenticated
  using (student_id = auth.uid());

-- conversations / participants / messages ---------------------
-- Created only through start_conversation() below; clients read
-- and write strictly inside their own conversations.
create policy "conversations select participant"
  on public.conversations for select to authenticated
  using (public.is_participant(id));

create policy "participants select own conversations"
  on public.conversation_participants for select to authenticated
  using (public.is_participant(conversation_id));

create policy "messages select participant"
  on public.messages for select to authenticated
  using (public.is_participant(conversation_id));

create policy "messages insert as self participant"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_participant(conversation_id)
  );

-- alerts ------------------------------------------------------
create policy "alerts select own"
  on public.alerts for select to authenticated
  using (profile_id = auth.uid());

create policy "alerts update own read state"
  on public.alerts for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- No insert/delete policies: alerts are written by triggers only.

-- ------------------------------------------------------------
-- 4. TRIGGERS
-- ------------------------------------------------------------

-- Create a profile row the moment a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'New user'),
    case
      when new.raw_user_meta_data ->> 'role' in ('student', 'employer')
        then new.raw_user_meta_data ->> 'role'
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- verified is a platform decision. auth.uid() is NULL for the SQL
-- editor and service role, so only the platform can change it.
create or replace function public.protect_job_verified()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and new.verified is distinct from old.verified then
    raise exception 'verified is managed by the platform';
  end if;
  return new;
end;
$$;

create trigger jobs_protect_verified
  before update on public.jobs
  for each row execute function public.protect_job_verified();

-- Server side business logic (SECURITY.md 1.2): notify the employer
-- when a proposal arrives, notify the student when it is decided.
create or replace function public.notify_proposal_created()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.alerts (profile_id, kind, title, body)
  select j.owner_id, 'proposal', 'New proposal received',
         p.name || ' applied to ' || j.title
  from public.jobs j
  join public.profiles p on p.id = new.student_id
  where j.id = new.job_id and j.owner_id is not null;
  return new;
end;
$$;

create trigger proposals_notify_created
  after insert on public.proposals
  for each row execute function public.notify_proposal_created();

create or replace function public.notify_proposal_decided()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status in ('accepted', 'declined') then
    insert into public.alerts (profile_id, kind, title, body)
    select new.student_id,
           case when new.status = 'accepted' then 'contract' else 'proposal' end,
           case when new.status = 'accepted'
                then 'Your proposal was accepted'
                else 'Update on your proposal' end,
           'Your proposal for ' || j.title || ' was ' || new.status || '.'
    from public.jobs j where j.id = new.job_id;
  end if;
  return new;
end;
$$;

create trigger proposals_notify_decided
  after update on public.proposals
  for each row execute function public.notify_proposal_decided();

-- ------------------------------------------------------------
-- 5. RPCs called by the app
-- ------------------------------------------------------------

-- Start (or reuse) a conversation with someone you share a proposal
-- relationship with. Validates the caller explicitly.
create or replace function public.start_conversation(other_profile uuid)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if other_profile = uid then
    raise exception 'cannot start a conversation with yourself';
  end if;
  if not public.shares_proposal(other_profile) then
    raise exception 'no shared job relationship';
  end if;

  select mine.conversation_id into conv
  from conversation_participants mine
  join conversation_participants theirs
    on theirs.conversation_id = mine.conversation_id
   and theirs.profile_id = other_profile
  where mine.profile_id = uid
  limit 1;

  if conv is null then
    insert into conversations default values returning id into conv;
    insert into conversation_participants (conversation_id, profile_id)
    values (conv, uid), (conv, other_profile);
  end if;

  return conv;
end;
$$;

-- GDPR erasure (SECURITY.md 5): wipes the caller's app data.
-- The auth account itself stays; full account deletion is a
-- platform action with the service role.
create or replace function public.delete_my_data()
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from proposals where student_id = uid;
  delete from jobs where owner_id = uid;
  delete from messages where sender_id = uid;
  delete from conversation_participants where profile_id = uid;
  delete from conversations c
    where not exists (
      select 1 from conversation_participants cp where cp.conversation_id = c.id
    );
  delete from alerts where profile_id = uid;
end;
$$;

revoke all on function public.start_conversation(uuid) from public, anon;
revoke all on function public.delete_my_data() from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.delete_my_data() to authenticated;
