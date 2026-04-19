# Architecture

One-page mental model. When you open this repo in 3 weeks and forget what goes
where, this is the file to reread.

## Systems

```
  ┌──────────────────────────┐          ┌──────────────────────────┐
  │  Next.js app (Vercel)    │          │  Scanner worker (VPS)    │
  │  - landing               │          │  - hourly cron           │
  │  - auth (Supabase)       │          │  - reddit.json fetcher   │
  │  - dashboard             │          │  - proxy rotation        │
  │  - API routes            │          │  - pattern matching      │
  │  - Stripe webhooks       │          │  - LLM scoring           │
  └────────────┬─────────────┘          └────────────┬─────────────┘
               │                                     │
               │ reads with RLS                      │ writes with service role
               │                                     │
               ▼                                     ▼
       ┌───────────────────────────────────────────────┐
       │              Supabase (Postgres)              │
       │  profiles · projects · raw_posts · leads      │
       │  openers · scan_runs                          │
       └───────────────────────────────────────────────┘
                                │
                                │ (openers on-demand)
                                ▼
                   ┌─────────────────────────┐
                   │    OpenAI API           │
                   │  scoring + openers      │
                   └─────────────────────────┘
```

## Data flow per scanner run

1. Cron fires on VPS (every hour)
2. `scanner/index.js` → `getActiveProjects()` from Supabase
3. For each project:
   a. `fetchManySubreddits(project.target_subreddits)` via Webshare proxies
   b. `upsertRawPosts()` — new posts get inserted, dupes silently skipped
   c. `matchesProject()` + `matchIntentPatterns()` → candidate leads
   d. `scoreLead()` via OpenAI for each candidate (capped at 50/run)
   e. `insertLead()` writes to `leads` table
4. `logScanRun()` + Telegram summary
5. User opens dashboard → sees ranked leads from RLS-filtered query

## Why the scanner is separate from Next.js

- Long-running background work doesn't fit Vercel's request model
- VPS cron is simpler than Vercel Cron + Upstash + serverless gymnastics
- Same pattern as OpenClaw for Xylo — already proven
- Scanner can be killed/restarted without touching the web app

## Key invariants

- **Scanner uses service role.** It bypasses RLS because it needs cross-user
  access (fetches projects across all users, writes raw_posts that don't
  belong to any single user).
- **Next.js uses authenticated client.** RLS enforces users only see their
  own projects/leads/openers.
- **Raw posts are shared.** One raw_post can be a lead for multiple projects
  (the same Reddit post could be relevant to two different products). The
  `leads` table handles that with its `unique (project_id, raw_post_id)`.
- **Openers are cached.** Once generated in a given mode, don't regenerate
  unless user explicitly asks. Saves money + keeps results consistent.

## What lives where

| Concern | File |
|---|---|
| DB schema | `supabase/migrations/0001_initial.sql` |
| TS types mirroring schema | `lib/types.ts` |
| Browser Supabase client | `lib/supabase-browser.ts` |
| Server Supabase client + service role | `lib/supabase-server.ts` |
| Reddit fetching | `scanner/reddit.js` |
| Proxy rotation | `scanner/proxy.js` |
| Intent pattern regex | `scanner/patterns.js` |
| LLM scoring | `scanner/scorer.js` |
| Scanner DB writes | `scanner/db.js` |
| Scanner orchestration | `scanner/index.js` |
| LLM scoring prompt | `prompts/lead-scoring.txt` |
| Opener prompts (3 modes) | `prompts/opener-{safe,soft,promo}.txt` |
| Subreddit suggestion prompt | `prompts/subreddit-suggest.txt` |
| Auth callback | `app/api/auth/callback/route.ts` |
| Stripe webhook | `app/api/stripe/webhook/route.ts` |

## What does NOT live here yet (future sessions)

- Google Rank Detection (Session 7) → `scanner/google-rank.js`
- Opener generator API route (Session 9) → `app/api/openers/route.ts`
- Onboarding form (Session 10) → `app/onboarding/page.tsx`
- Billing portal (Session 11) → `app/api/stripe/portal/route.ts`
- MediaFast-style roadmap (post-validation only)
- Viral templates (post-validation only)
- Account warm-up tracker (post-validation only)
