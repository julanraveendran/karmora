# Karmora

Reddit customer discovery copilot for founders.

Scans Reddit for high-intent leads, scores them with AI, suggests safe-mode
reply openers, and lets you dismiss / mark engaged. Every action is
human-approved.

## What works in v1

- Magic-link sign-in (Supabase Auth)
- Create projects with target subreddits + keywords
- Hourly scanner pipeline (VPS): Reddit `.json` → Webshare proxy rotation
  → intent-pattern matcher → LLM scoring → `leads` table
- Dashboard: per-project lead list ranked by `combined_score`
- One-click AI opener generation (Safe mode, value-only, no product mention)
- Lead status: new / reviewed / engaged / dismissed
- Stripe webhook wiring for plan tier (free = 1 project, pro = 5)

## Deferred (build only after first paying user)

- Google Rank Detection (SerpAPI) — wire `scanner/google-rank.js`
- Soft / Promo opener modes — prompts exist, expose in UI
- AI subreddit suggestions during onboarding
- Stripe checkout/portal flow (webhook is wired, checkout is not)
- Polished landing page

## Stack

- **Web:** Next.js 14 (App Router) + TypeScript + Tailwind → Vercel
- **DB + Auth:** Supabase (Postgres + RLS)
- **Billing:** Stripe (webhook only — checkout TBD)
- **Scanner:** Node 20 ESM on Hostinger VPS, hourly cron
- **AI:** OpenAI (`gpt-4o-mini` for scoring, `gpt-4o` for openers)
- **Proxies:** Webshare.io free tier (10 rotating IPs)

## Compliance posture (READ THIS BEFORE TALKING ABOUT THE PRODUCT)

Karmora is a **Reddit customer discovery copilot**. Never "scraper", never
"automation", never "auto-reply". Every reply is human-approved. We use
Reddit's public `.json` endpoints with proper user-agent identification and
rate limiting.

This framing is not cosmetic — Reddit's Responsible Builder Policy can
block your domain if you market as a scraper or auto-poster.

## Ship checklist

### 1. Supabase (15 min)

1. Create new project at supabase.com (region: London)
2. Settings → API → copy URL + anon key + service role key into `.env.local`
3. SQL editor → paste `supabase/migrations/0001_initial.sql` → Run
4. Auth → Providers → Email enabled (magic link)
5. Auth → URL Configuration → add `http://localhost:3000/api/auth/callback`
   (and your Vercel URL once deployed)

### 2. OpenAI + Webshare (10 min)

1. OpenAI key → `.env.local` as `OPENAI_API_KEY`
2. Webshare.io free tier → 10 proxies in `USER:PASS@HOST:PORT` format,
   comma-separated, into `WEBSHARE_PROXY_LIST`

### 3. Stripe (15 min, optional for v1)

Skip if you just want to dogfood. Plan limits still work (free tier =
1 project) without checkout — there's just no path to upgrade yet.

If wiring it up: see `app/api/stripe/webhook/route.ts`. You'll need
checkout + portal routes (deferred above).

### 4. Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase + OpenAI + Webshare
npm run dev
```

Visit http://localhost:3000 → magic link → /dashboard → create project.

### 5. Vercel deploy

```bash
git push
# Import the repo on Vercel, paste env vars, deploy
# Add the Vercel URL to Supabase Auth Redirect URLs
```

### 6. Scanner on VPS

```bash
# Local: copy scanner/ to VPS
rsync -avz --exclude node_modules scanner/ root@vps:/root/karmora-scanner/

# On VPS:
cd /root/karmora-scanner
npm install --omit=dev
# Create .env with Supabase service role + OpenAI + Webshare + Telegram

# Test once
node index.js --once

# Install cron
crontab -e
# 0 * * * * cd /root/karmora-scanner && /usr/bin/node index.js --once >> /var/log/karmora-scanner.log 2>&1
```

See `docs/SESSION_4_PROMPT.md` for the full VPS playbook.

## Project layout

```
app/                 Next.js App Router
  page.tsx           Landing + sign-in
  dashboard/         Logged-in shell
    page.tsx         Project list
    [projectId]/     Per-project lead list
  onboarding/        Create-project form
  api/
    auth/callback    Magic link exchange
    projects         POST /api/projects
    leads/[id]       PATCH /api/leads/:id
    openers          POST /api/openers
    stripe/webhook   Stripe events
components/          Client components
lib/                 Supabase clients + types
prompts/             LLM prompts (scoring + 3 opener modes)
scanner/             VPS worker (separate package.json)
supabase/            SQL migrations
docs/                Architecture + session prompts
```

## Rules (ADHD guardrails — DO NOT SKIP)

- One session = one shippable thing
- No refactors mid-phase
- Every `npm install` gets a line in `docs/DECISIONS.md`
- No auto-post / auto-comment features. Ever.
- No fabricated metrics in marketing
- No scope creep until 5 real users are active

## Known security advisories

`npm audit` flags 4 high-severity Next.js issues that require Next 16 (a
major-version breaking change) to resolve. They are: image optimizer DoS,
RSC deserialization DoS, rewrites smuggling, image cache exhaustion. None
affect this app's current attack surface (no public image optimizer, no
unauthenticated rewrites). Re-evaluate before opening to public traffic.
