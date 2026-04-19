# Decisions log

Append-only. Every non-obvious choice gets a line here. Future-you will thank you.

Format: `YYYY-MM-DD — decision — why`

---

## 2026-04-19 — v1 build (sessions 2-9 compressed)

- **Compressed sessions 2-9 into one build** — user prioritised functioning v1 over the staged session plan. Tradeoff: no end-to-end runtime verification (no Supabase project, no keys), only typecheck + production build. Code is in place; live verification happens when user wires keys.
- **`openai` added to root package.json** — needed in `app/api/openers/route.ts` for opener generation. Already lived in `scanner/package.json`; same package, two separate node_modules trees by design (scanner is a self-contained VPS deploy).
- **`eslint` pinned to ^8.57.0** — eslint-config-next 14.2 peer-deps require eslint 7 or 8. Original scaffold's ^9 caused install failure.
- **`next` and `eslint-config-next` bumped to 14.2.35** — original 14.2.15 had a security advisory (2025-12-11). Stayed within 14.2.x to avoid major-version churn. Four remaining audit findings need Next 16; documented in README.
- **Stripe API version bumped to `2025-02-24.acacia`** — match installed `stripe@17.x` types. Wire as part of v1 webhook stub; checkout/portal still deferred.
- **Opener UI ships Safe mode only** — Soft/Promo prompts exist; UI toggle is post-validation. Karma gate logic for Promo lives in the API route already (`reddit_karma >= 1000`) so adding the UI later is just a button.

## 2026-04-19 — Initial architecture

- **Next.js 14 App Router** — same stack as Xylo, lowest cognitive load
- **Supabase over Neon + NextAuth** — auth + DB + RLS in one place, solo founder can't afford more moving parts
- **Node scanner on VPS, not serverless** — cron jobs are simpler than Vercel Cron + Upstash, and OpenClaw pattern is already proven
- **ESM scanner, CJS avoided** — modern Node, and OpenAI SDK is ESM-first anyway
- **`gpt-4o-mini` for scoring, `gpt-4o` for openers** — scoring runs 100s of times/hour, openers run when user clicks. Cost balance.
- **Webshare free tier, not Bright Data** — 10 proxies handles 5 subs × 6 scans/day fine. Upgrade only on user-reported reliability issue.
- **SerpAPI for Google rank, not DIY scraping** — Google will ban DIY SERP scraping fast. 100/mo free tier covers MVP.
- **No queue (BullMQ/Inngest)** — direct DB writes at MVP scale. Add queue only when scanner takes >5min per cycle.
- **No Redis** — Supabase is enough for now. Add Upstash if we need caching.

## Future decisions to revisit

- [ ] If Reddit `.json` endpoints get rate-limited harder → add PullPush fallback
- [ ] If Webshare free runs out of bandwidth → move to Webshare paid ($2.99/mo) before Bright Data
- [ ] If we hit 50 users → extract scanner to a separate GitHub repo for independent deploys
