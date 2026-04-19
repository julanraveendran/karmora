# Karmora

Reddit customer discovery copilot for founders.

Scans Reddit for high-intent leads, scores them with AI, suggests openers in three
safety modes, and flags posts that rank on Google (SEO gold).

## Stack

- **Web:** Next.js 14 (App Router) + TypeScript + Tailwind → Vercel
- **DB + Auth:** Supabase (Postgres + Row Level Security)
- **Billing:** Stripe
- **Scanner worker:** Node 20 ESM on Hostinger VPS, cron every hour
- **AI:** OpenAI (`gpt-4o-mini` for scoring, `gpt-4o` for openers)
- **Proxies:** Webshare.io free tier (10 rotating IPs)

## Compliance posture (READ THIS BEFORE TALKING ABOUT THE PRODUCT)

Karmora is a **Reddit customer discovery copilot**. Never "scraper", never
"automation", never "auto-reply". Every action is human-approved. We use Reddit's
public `.json` endpoints with proper user-agent identification and rate limiting.

This framing is not cosmetic — Reddit's Responsible Builder Policy can block your
domain if you market as a scraper or auto-poster.

## Local setup

```bash
# 1. Clone + install
git clone <your-repo> karmora && cd karmora
npm install

# 2. Env
cp .env.example .env.local
# Fill in Supabase, Stripe, OpenAI keys

# 3. Database
# In Supabase SQL editor, run supabase/migrations/0001_initial.sql

# 4. Dev
npm run dev
```

### Scanner (VPS)

```bash
cd scanner
npm install
cp ../.env.example .env
# Fill in scanner/.env with same Supabase + OpenAI keys

# Test once
npm run scan:once

# Install cron (on VPS)
crontab -e
# 0 * * * * cd /home/julan/karmora-scanner && /usr/bin/node index.js >> logs/cron.log 2>&1
```

## Session plan (DO NOT SKIP AHEAD)

| Session | Scope | Ship when |
|---|---|---|
| 1 | Skeleton, Supabase, Stripe plumbing | Empty dashboard loads |
| 2 | Single-subreddit scanner (manual run) | 25 posts in `raw_posts` |
| 3 | Proxy rotation + multi-subreddit | 5 subreddits scan without 429 |
| 4 | Cron on VPS + Telegram alerts | Runs hourly unattended 24h |
| 5 | Hardcoded intent patterns | ~10% of raw posts flagged |
| 6 | LLM scoring layer | Top 20 leads ranked on dashboard |
| 7 | Google Rank Detection | 🔥 badge on ranking leads |
| 8 | Lead dashboard UX | You dogfood it for painting biz |
| 9 | AI opener w/ safety modes | Copy-paste worthy openers |
| 10 | MediaFast-style onboarding | <3 min signup → first leads |
| 11 | Landing + billing wiring | Free/Pro limits enforce |
| 12 | Validation push | 5 signups |

**Hard stop after Session 12.** Do not build roadmap/templates/warm-up
features until 5 real users are active.

## Rules (ADHD guardrails)

- One session = one shippable thing
- No refactors mid-phase — only end of Week 2 and Week 4
- Every `npm install` gets a line in `docs/DECISIONS.md` explaining why
- No auto-post/auto-comment features ever
- No fabricated metrics in marketing
- No scope creep from MediaFast demo until validation succeeds
