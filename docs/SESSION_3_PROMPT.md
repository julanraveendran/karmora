# Session 3 — paste-ready Claude Code prompt

**When to use:** After Session 2 ships (scanner writes posts from one
subreddit). Sign up at webshare.io free tier first, download the 10 free
proxies, then paste this into Claude Code.

**Session goal:** Same scanner, now scanning 5 subreddits through rotating
proxies. Zero 429s.

---

I'm working on Karmora. Session 2 is done — the scanner runs end-to-end
against one subreddit with proxies disabled. Now I'm in **Session 3: Proxy
rotation + multi-subreddit**.

## Prereq (do this BEFORE running Claude Code)

- Sign up at webshare.io (free tier = 10 proxies)
- Download the proxy list in `USER:PASS@HOST:PORT` format
- Have those 10 proxy strings ready to paste

## What's already built

- `scanner/proxy.js` — round-robin rotator using `undici` `ProxyAgent`. It
  reads `WEBSHARE_PROXY_LIST` (comma-separated) and `USE_PROXIES`. Already
  wired into `scanner/reddit.js` via `getProxyAgent()`. No code changes
  needed there.
- `scanner/index.js` — already loops over `project.target_subreddits`, no
  changes needed.

## Tasks (in order)

1. **Add proxies to `scanner/.env`:**
   ```
   USE_PROXIES=true
   WEBSHARE_PROXY_LIST=user:pass@1.2.3.4:8080,user:pass@5.6.7.8:8080,...
   ```
   Comma-separated, no spaces, all 10 proxies on one line.

2. **Expand the test project to 5 subreddits.** In Supabase SQL editor:
   ```sql
   update projects
   set target_subreddits = array[
     'SaaS', 'startups', 'Entrepreneur', 'smallbusiness', 'SideProject'
   ]
   where name = 'Karmora self-test';
   ```

3. **Add proxy rotation visibility.** In `scanner/proxy.js`, inside
   `getProxyAgent()`, add ONE line right before the return:
   ```js
   console.log(`[proxy] using #${cursor % proxyList.length}`);
   ```
   This gives you visual proof rotation is working. (Note: `cursor` is
   already incremented before this point in the existing code — adjust
   logic so the printed index matches the proxy actually being used.)

4. **Run the scanner:** `cd scanner && npm run scan:once`

5. **Verify in console:**
   - `[proxy] loaded 10 proxies`
   - `[proxy] using #0`, `#1`, `#2`... (different indices each request)
   - No `rate limited: ...` errors thrown
   - Final log: `[Karmora self-test] done: ~125 posts, ...`

6. **Verify in Supabase:**
   - `raw_posts` total grows by ~125 (5 subs × 25 posts; minus dupes from
     Session 2)
   - `scan_runs` → new row with `posts_fetched ≈ 125`, `errors=null`

## Ship when

- Clean console: no 429s, visible proxy rotation
- ~125 new `raw_posts` rows
- Commit: `session 3: webshare rotation + 5-sub scan`

## If you hit 429s anyway

- First fix: bump `DELAY_MS` in `scanner/reddit.js` from 2000ms → 4000ms
  and re-run.
- Do NOT add Bright Data. Do NOT add ScraperAPI. Do NOT add headers
  beyond the existing User-Agent. That's premature optimization (see
  `docs/DECISIONS.md`).

## Do NOT

- Touch the Next.js app
- Tune patterns/scoring (Session 5/6)
- Deploy to VPS yet (Session 4)
- Add Bright Data/ScraperAPI fallbacks
