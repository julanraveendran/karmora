# Session 4 — paste-ready Claude Code prompt

**When to use:** After Session 3 ships (proxies working, 5 subs clean).
You'll need SSH access to the Hostinger VPS (`srv1521543.hstgr.cloud`,
user `root`, key `~/.ssh/id_ed25519` / comment `julan@karmora-deploy`)
and a Telegram bot token + chat ID for Karmora (see step 3).

**Status (2026-04-24):** Deployed. Scanner lives at
`/root/karmora/scanner/` with prompts at `/root/karmora/prompts/`.
Hourly cron fires and writes Telegram summaries to `@karmoramainbot`.

**Session goal:** Scanner running on the VPS via crontab hourly, Telegram
alerts on failure. Truly unattended.

---

I'm working on Karmora. Sessions 1-3 are done — scanner runs locally
against 5 subreddits through Webshare proxies. Now: **Session 4: Cron on
VPS.** Make it run hourly without me babysitting it.

## Prereqs

- SSH access to the Hostinger VPS (same one as OpenClaw — reuse the same
  user/key)
- Telegram bot token + chat ID from Xylo (reuse them — both apps can ping
  the same chat)
- Node 20+ installed on the VPS (OpenClaw already needs this, so it
  should be there — verify with `node --version` over SSH)

## Tasks (in order)

1. **Copy scanner + prompts to VPS.** Scorer.js reads
   `../prompts/lead-scoring.txt`, so the prompts dir must sit next to the
   scanner dir. Deploy layout is `/root/karmora/{scanner,prompts}/`.
   From local Karmora root (rsync not installed in Git Bash → tar + scp):
   ```bash
   tar czf /tmp/karmora-scanner.tar.gz -C scanner \
     --exclude=node_modules --exclude=.env .
   scp /tmp/karmora-scanner.tar.gz scanner/.env \
     root@srv1521543.hstgr.cloud:/tmp/
   scp -r prompts root@srv1521543.hstgr.cloud:/tmp/prompts-new
   ```

2. **SSH in, lay out the tree, install deps:**
   ```bash
   ssh root@srv1521543.hstgr.cloud
   mkdir -p /root/karmora/scanner
   tar xzf /tmp/karmora-scanner.tar.gz -C /root/karmora/scanner/
   mv /tmp/.env /root/karmora/scanner/.env
   chmod 600 /root/karmora/scanner/.env
   rm -rf /root/karmora/prompts && mv /tmp/prompts-new /root/karmora/prompts
   rm /tmp/karmora-scanner.tar.gz
   cd /root/karmora/scanner && npm ci --omit=dev
   ```

3. **Telegram bot.** Karmora uses its own bot (`@karmoramainbot`), NOT
   Xylo's. If starting fresh:
   - DM `@BotFather` → `/newbot` → get `TELEGRAM_BOT_TOKEN`
   - Send a message to the bot, then
     `curl https://api.telegram.org/bot<TOKEN>/getUpdates` → grab
     `result[].message.chat.id` → that's your `TELEGRAM_CHAT_ID`
   - Put both in `scanner/.env` locally, then re-scp the `.env`

4. **Test one manual run on VPS:**
   ```bash
   cd /root/karmora/scanner && node index.js --once
   ```
   Expect: console output + Telegram summary message.

5. **Add hourly crontab.** Run `crontab -e` and append:
   ```
   0 * * * * cd /root/karmora/scanner && /usr/bin/node index.js --once >> /var/log/karmora-scanner.log 2>&1
   ```
   (Confirm node path with `which node` — `/usr/bin/node` on this VPS.)

6. **Pre-create the log file** so cron can write to it:
   ```bash
   touch /var/log/karmora-scanner.log
   chmod 644 /var/log/karmora-scanner.log
   ```

7. **Wait for the next top-of-hour**, then tail the log:
   ```bash
   tail -f /var/log/karmora-scanner.log
   ```
   Confirm the run starts, completes, Telegram pings.

## Ship when

- Cron has fired at least twice unattended (so wait at least 2 hours
  after the first successful run)
- Telegram received both run summaries
- `scan_runs` table in Supabase has matching rows for both fires
- `/var/log/karmora-scanner.log` is growing, no fatal errors
- Commit (locally, since the VPS code is a deployment, not source of
  truth): `session 4: hourly cron on hostinger VPS`

## Failure-mode test

Before you walk away, intentionally break something to confirm Telegram
catches it. DO NOT move `.env` away — that also strips Telegram creds, so
no alert can fire. Instead, shadow a single var:

```bash
cd /root/karmora/scanner && \
  SUPABASE_SERVICE_ROLE_KEY=invalid_for_test node index.js --once
```

Expect: fatal error `Invalid API key` → Telegram alert via `alertError()`
in `scanner/telegram.js`. No cleanup needed (the override was in-shell).

If no Telegram alert fired, fix `scanner/telegram.js` before declaring
done. Silent failures are worse than no monitoring.

## Do NOT

- Touch the Next.js app
- Add SystemD service / PM2 — crontab is enough at this scale
- Set the cron to anything faster than hourly (cost + ban risk)
- Deploy the Next.js dashboard to a different host — Vercel from
  Session 1 is fine
- Start Session 5 (intent patterns) in the same sitting. Walk away. Let
  it run for 24h before declaring victory.

## Known issue (parked 2026-04-24)

Three subreddits — r/Entrepreneur, r/smallbusiness, r/SideProject —
consistently return HTTP 403 from Webshare proxies. The scanner still
succeeds on the other 3 subs. Fix in a dedicated session (rotate UA,
switch to `/new.json?limit=25&raw_json=1`, or try a different proxy
provider).
