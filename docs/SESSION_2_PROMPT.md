# Session 2 — paste-ready Claude Code prompt

**When to use:** Open a fresh Claude Code in the `karmora` repo, paste
everything between the `---` lines verbatim. Walk away. Come back when it's
done.

**Session goal:** Scanner runs end-to-end against ONE subreddit (no proxies)
and writes ~25 posts to Supabase `raw_posts`. That's it.

---

I'm working on Karmora — a Reddit customer discovery copilot. The scaffold
is already in place (Session 1 done: Supabase tables exist, Stripe wired,
Next.js boots).

This is **Session 2: Single-subreddit scanner**. Goal: prove the scanner
pipeline works end-to-end with the simplest possible config.

## What's already built (don't recreate)

- `scanner/index.js` — orchestrator (entry point)
- `scanner/reddit.js` — fetches reddit.com/r/{sub}/new.json
- `scanner/proxy.js` — proxy rotator (we'll DISABLE for this session)
- `scanner/db.js` — Supabase writes via service role
- `scanner/patterns.js`, `scanner/scorer.js` — leave alone, used later
- `supabase/migrations/0001_initial.sql` — already ran in Session 1

## Tasks (in order)

1. **Install scanner deps:** `cd scanner && npm install`

2. **Create `scanner/.env`** (NOT `.env.local` — the scanner is a separate
   Node app). Required vars:
   - `NEXT_PUBLIC_SUPABASE_URL` — copy from root `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` — copy from root `.env.local`
   - `OPENAI_API_KEY` — real key if you have one, otherwise `sk-placeholder`
     (LLM scoring will fail gracefully and leave `llm_score=null`)
   - `OPENAI_MODEL_SCORING=gpt-4o-mini`
   - `USE_PROXIES=false`
   - `REDDIT_USER_AGENT=karmora/0.1 (contact julan@karmora.app)`

3. **Fix the dynamic-import wart** in `scanner/index.js` (~line 103). It
   currently does `await import('./db.js').then(...)` inside a hot loop. The
   `db` client is already exported from `scanner/db.js` — import it once at
   the top of `index.js` and use it directly. One-line cleanup, do it now
   before the file gets bigger.

4. **Seed one test project in Supabase.** Open the SQL editor and run:
   ```sql
   insert into projects (user_id, name, description, target_subreddits, status)
   values (
     (select id from auth.users limit 1),
     'Karmora self-test',
     'Self-test project for scanner validation',
     array['SaaS'],
     'active'
   );
   ```
   (Assumes you invited yourself as a user in Session 1. If not, do that
   first — Auth → Users → Invite user.)

5. **Run the scanner once:** `cd scanner && npm run scan:once`

6. **Verify in Supabase Table Editor:**
   - `raw_posts` → ~25 rows with `subreddit='SaaS'`
   - `scan_runs` → 1 row with `posts_fetched=25`, `errors=null`
   - `projects` → `last_scanned_at` updated

## Ship when

- 25+ rows in `raw_posts`
- 1 successful row in `scan_runs`
- No unhandled errors in console (LLM errors are fine — that's expected
  if `OPENAI_API_KEY` is a placeholder)
- Commit: `session 2: single-sub scanner end-to-end`

## Do NOT

- Touch the Next.js app (no dashboard changes this session)
- Enable proxies — that's Session 3
- Add more subreddits — that's Session 3
- Tune pattern matching or LLM prompts — that's Session 5/6
- Deploy anywhere — that's Session 4

If anything is unclear or a step fails, stop and ask before improvising.
