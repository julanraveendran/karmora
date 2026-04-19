-- ─── Karmora initial schema ─────────────────────────────────────────
-- Run this in Supabase SQL Editor for a fresh project.
-- Every table has Row Level Security ON. Service role bypasses RLS
-- (that's what the scanner uses). The anon/authenticated user can only
-- see their own rows.

-- ─── Extensions ─────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;  -- fuzzy text search for later

-- ─── Enums ──────────────────────────────────────────────────────────
create type plan_tier as enum ('free', 'pro');
create type lead_status as enum ('new', 'reviewed', 'engaged', 'dismissed');
create type safety_mode as enum ('safe', 'soft', 'promo');
create type project_status as enum ('active', 'paused');

-- ─── Users ──────────────────────────────────────────────────────────
-- Supabase already creates auth.users. We extend it with a profile row.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan plan_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  reddit_karma int,              -- self-reported, gates 'promo' mode
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);

-- ─── Projects ───────────────────────────────────────────────────────
-- A project = one product the user wants leads for.
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  product_url text,
  description text not null,
  icp text,                      -- ideal customer profile, free-form
  target_subreddits text[] not null default '{}',
  keywords text[] not null default '{}',  -- extra search terms
  exclude_keywords text[] not null default '{}',
  status project_status not null default 'active',
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_user on public.projects(user_id);
create index idx_projects_status on public.projects(status) where status = 'active';

-- ─── Raw posts ──────────────────────────────────────────────────────
-- Everything the scanner pulls from Reddit. Deduped by reddit_id.
-- Scanner writes, classifier reads, classifier sets classified_at.
create table public.raw_posts (
  id uuid primary key default uuid_generate_v4(),
  reddit_id text not null unique,        -- e.g. "t3_abc123"
  subreddit text not null,
  title text not null,
  body text,
  author text,
  url text not null,                     -- full reddit permalink
  score int,                             -- reddit upvotes at fetch time
  num_comments int,
  posted_at timestamptz not null,        -- from reddit
  fetched_at timestamptz not null default now(),
  classified_at timestamptz,             -- null = not yet processed
  raw_json jsonb                         -- keep full payload for debugging
);

create index idx_raw_posts_classified on public.raw_posts(classified_at)
  where classified_at is null;
create index idx_raw_posts_subreddit on public.raw_posts(subreddit);
create index idx_raw_posts_posted_at on public.raw_posts(posted_at desc);
create index idx_raw_posts_body_trgm on public.raw_posts using gin (body gin_trgm_ops);

-- ─── Leads ──────────────────────────────────────────────────────────
-- A raw_post matched against a project becomes a lead.
-- Same post can be a lead for multiple projects.
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  raw_post_id uuid not null references public.raw_posts(id) on delete cascade,

  -- scoring
  pattern_score int not null default 0,     -- 0-10, from hardcoded phrases
  llm_score int,                            -- 0-10, from gpt-4o-mini
  combined_score int generated always as (
    coalesce(pattern_score, 0) + coalesce(llm_score, 0) * 2
  ) stored,

  -- reasoning
  matched_patterns text[] not null default '{}',
  llm_reasoning text,
  pain_point text,

  -- google rank flag
  google_rank int,                          -- position on page 1, null = not checked
  google_checked_at timestamptz,

  -- user state
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

-- ─── Generated openers ──────────────────────────────────────────────
-- Cached so we don't re-spend on OpenAI if user regenerates
create table public.openers (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  mode safety_mode not null,
  content text not null,
  model text not null,
  created_at timestamptz not null default now()
);

create index idx_openers_lead on public.openers(lead_id, mode);

-- ─── Scan runs (observability) ──────────────────────────────────────
-- Every scanner run logs here. Useful for debugging + rate limit tuning.
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

-- ─── Row Level Security ────────────────────────────────────────────

-- profiles: user can see/update their own row
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

-- projects: user can CRUD their own projects
alter table public.projects enable row level security;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id);

-- leads: user can see leads belonging to their projects
alter table public.leads enable row level security;
create policy "own leads read" on public.leads
  for select using (
    exists (select 1 from public.projects p
            where p.id = leads.project_id and p.user_id = auth.uid())
  );
create policy "own leads update" on public.leads
  for update using (
    exists (select 1 from public.projects p
            where p.id = leads.project_id and p.user_id = auth.uid())
  );

-- openers: user can see openers for their leads
alter table public.openers enable row level security;
create policy "own openers" on public.openers
  for select using (
    exists (select 1 from public.leads l
            join public.projects p on p.id = l.project_id
            where l.id = openers.lead_id and p.user_id = auth.uid())
  );

-- raw_posts + scan_runs: service role only (no user access)
alter table public.raw_posts enable row level security;
alter table public.scan_runs enable row level security;
-- No policies = no access for anon/authenticated. Service role bypasses RLS.

-- ─── Trigger: auto-create profile on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Trigger: update updated_at ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();
create trigger leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

-- ─── Plan limits helper (used by API routes) ────────────────────────
create or replace function public.user_can_create_project(uid uuid)
returns boolean language plpgsql stable as $$
declare
  user_plan plan_tier;
  project_count int;
begin
  select plan into user_plan from public.profiles where id = uid;
  select count(*) into project_count from public.projects where user_id = uid;

  if user_plan = 'pro' then
    return project_count < 5;
  else
    return project_count < 1;
  end if;
end;
$$;
