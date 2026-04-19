# Session 4 — paste-ready Claude Code prompt

**When to use:** After Session 3 ships (proxies working, 5 subs clean).
You'll need SSH access to the Hostinger VPS that runs OpenClaw, plus your
existing Telegram bot token + chat ID from Xylo.

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

1. **Copy scanner to VPS.** From local Karmora root:
   ```bash
   rsync -avz --exclude node_modules --exclude .env scanner/ \
     root@<vps-ip>:/root/karmora-scanner/
   ```
   (Or scp -r, whichever you've used for OpenClaw. Keep it parallel to
   `/root/openclaw/`.)

2. **SSH in, install deps:**
   ```bash
   ssh root@<vps-ip>
   cd /root/karmora-scanner
   npm install --omit=dev
   ```

3. **Create `/root/karmora-scanner/.env`** with the same vars as local
   `scanner/.env` PLUS:
   ```
   TELEGRAM_BOT_TOKEN=<from xylo .env>
   TELEGRAM_CHAT_ID=<from xylo .env>
   ```
   `chmod 600 .env` so it's not world-readable.

4. **Test one manual run on VPS:**
   ```bash
   cd /root/karmora-scanner && node index.js --once
   ```
   Expect: same console output as local, plus a Telegram message with the
   run summary.

5. **Add hourly crontab.** Run `crontab -e` and append:
   ```
   0 * * * * cd /root/karmora-scanner && /usr/bin/node index.js --once >> /var/log/karmora-scanner.log 2>&1
   ```
   (Confirm node path with `which node` — `/usr/bin/node` is common but
   not universal. NVM users will have a different path.)

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
catches it:

1. SSH in: `mv /root/karmora-scanner/.env /root/karmora-scanner/.env.bak`
2. Run: `cd /root/karmora-scanner && node index.js --once`
3. Expect: Telegram receives an error alert via `alertError()` in
   `scanner/telegram.js`
4. Restore: `mv /root/karmora-scanner/.env.bak /root/karmora-scanner/.env`

If no Telegram alert fired on the broken run, fix `scanner/telegram.js`
before declaring done. Silent failures are worse than no monitoring.

## Do NOT

- Touch the Next.js app
- Add SystemD service / PM2 — crontab is enough at this scale
- Set the cron to anything faster than hourly (cost + ban risk)
- Deploy the Next.js dashboard to a different host — Vercel from
  Session 1 is fine
- Start Session 5 (intent patterns) in the same sitting. Walk away. Let
  it run for 24h before declaring victory.
