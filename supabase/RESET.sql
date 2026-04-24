-- ─── Karmora full reset for Clerk auth migration ──────────────────
-- Paste this entire file into Supabase Dashboard → SQL Editor → Run.
-- Wipes all existing public tables (no real users, per confirmation)
-- and rebuilds the schema for Clerk-based auth.

-- ─── 1. Wipe old schema ─────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.user_can_create_project(uuid) cascade;
drop function if exists public.user_can_create_project(text) cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.openers cascade;
drop table if exists public.leads cascade;
drop table if exists public.scan_runs cascade;
drop table if exists public.raw_posts cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

drop type if exists plan_tier cascade;
drop type if exists lead_status cascade;
drop type if exists safety_mode cascade;
drop type if exists project_status cascade;

-- ─── 2. Rebuild ─────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

create type plan_tier as enum ('free', 'pro');
create type lead_status as enum ('new', 'reviewed', 'engaged', 'dismissed');
create type safety_mode as enum ('safe', 'soft', 'promo');
create type project_status as enum ('active', 'paused');

create table public.profiles (
  id text primary key,
  email text not null,
  plan plan_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  reddit_karma int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  product_url text,
  description text not null,
  icp text,
  target_subreddits text[] not null default '{}',
  keywords text[] not null default '{}',
  exclude_keywords text[] not null default '{}',
  status project_status not null default 'active',
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_projects_user on public.projects(user_id);
create index idx_projects_status on public.projects(status) where status = 'active';

create table public.raw_posts (
  id uuid primary key default uuid_generate_v4(),
  reddit_id text not null unique,
  subreddit text not null,
  title text not null,
  body text,
  author text,
  url text not null,
  score int,
  num_comments int,
  posted_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  classified_at timestamptz,
  raw_json jsonb
);
create index idx_raw_posts_classified on public.raw_posts(classified_at) where classified_at is null;
create index idx_raw_posts_subreddit on public.raw_posts(subreddit);
create index idx_raw_posts_posted_at on public.raw_posts(posted_at desc);
create index idx_raw_posts_body_trgm on public.raw_posts using gin (body gin_trgm_ops);

create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  raw_post_id uuid not null references public.raw_posts(id) on delete cascade,
  pattern_score int not null default 0,
  llm_score int,
  combined_score int generated always as (
    coalesce(pattern_score, 0) + coalesce(llm_score, 0) * 2
  ) stored,
  matched_patterns text[] not null default '{}',
  llm_reasoning text,
  pain_point text,
  google_rank int,
  google_checked_at timestamptz,
  status lead_status not null default 'new',
  user_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, raw_post_id)
);
create index idx_leads_project on public.leads(project_id);
create index idx_leads_status on public.leads(project_id, status);
create index idx_leads_score on public.leads(project_id, combined_score desc);
create index idx_leads_new on public.leads(created_at desc) where status = 'new';

create table public.openers (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  mode safety_mode not null,
  content text not null,
  model text not null,
  created_at timestamptz not null default now()
);
create index idx_openers_lead on public.openers(lead_id, mode);

create table public.scan_runs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete set null,
  subreddits_scanned text[] not null default '{}',
  posts_fetched int not null default 0,
  posts_new int not null default 0,
  leads_created int not null default 0,
  errors jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms int
);
create index idx_scan_runs_project on public.scan_runs(project_id, started_at desc);

-- ─── 3. RLS (Clerk-aware) ───────────────────────────────────────────
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles
  for select using ((auth.jwt() ->> 'sub') = id);
create policy "own profile update" on public.profiles
  for update using ((auth.jwt() ->> 'sub') = id);

alter table public.projects enable row level security;
create policy "own projects" on public.projects
  for all using ((auth.jwt() ->> 'sub') = user_id);

alter table public.leads enable row level security;
create policy "own leads read" on public.leads
  for select using (
    exists (select 1 from public.projects p
            where p.id = leads.project_id and p.user_id = (auth.jwt() ->> 'sub'))
  );
create policy "own leads update" on public.leads
  for update using (
    exists (select 1 from public.projects p
            where p.id = leads.project_id and p.user_id = (auth.jwt() ->> 'sub'))
  );

alter table public.openers enable row level security;
create policy "own openers" on public.openers
  for select using (
    exists (select 1 from public.leads l
            join public.projects p on p.id = l.project_id
            where l.id = openers.lead_id and p.user_id = (auth.jwt() ->> 'sub'))
  );

alter table public.raw_posts enable row level security;
alter table public.scan_runs enable row level security;

create policy "read raw_posts via own leads" on public.raw_posts
  for select using (
    exists (
      select 1 from public.leads l
      join public.projects p on p.id = l.project_id
      where l.raw_post_id = raw_posts.id
        and p.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- ─── 4. Triggers + helpers ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();
create trigger leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

create or replace function public.user_can_create_project(uid text)
returns boolean language plpgsql stable as $$
declare
  user_plan plan_tier;
  project_count int;
begin
  select plan into user_plan from public.profiles where id = uid;
  select count(*) into project_count from public.projects where user_id = uid;
  if user_plan = 'pro' then return project_count < 5;
  else return project_count < 1;
  end if;
end;
$$;
