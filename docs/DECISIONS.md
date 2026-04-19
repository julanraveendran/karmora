# Decisions log

Append-only. Every non-obvious choice gets a line here. Future-you will thank you.

Format: `YYYY-MM-DD — decision — why`

---

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
