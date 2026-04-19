# Session 1 checklist (2-3 hours)

**Goal:** Empty dashboard loads, logged-in user sees "no projects yet",
Supabase wired, Stripe skeleton in place.

Do these in order. Check each off before moving on.

## Setup (30 min)

- [ ] Create new GitHub repo `karmora` (private for now)
- [ ] Copy all files from this scaffold into the repo
- [ ] `npm install` in root
- [ ] Open in Cursor

## Supabase (45 min)

- [ ] Create new Supabase project at supabase.com (region: London)
- [ ] Copy Project URL + anon key + service role key → `.env.local`
- [ ] Open SQL editor, paste contents of `supabase/migrations/0001_initial.sql`
- [ ] Click Run — should see "Success. No rows returned"
- [ ] In Auth → Providers → enable Email (magic link is fine)
- [ ] In Auth → URL Configuration → add `http://localhost:3000/api/auth/callback`
      to Redirect URLs
- [ ] Test: in Supabase dashboard, Table Editor → verify all 6 tables exist

## Stripe (30 min)

- [ ] In Stripe Dashboard (test mode) → create product "Karmora Pro"
- [ ] Add price: $29/month recurring
- [ ] Copy the price ID (`price_...`) → `.env.local` as `STRIPE_PRICE_ID_PRO`
- [ ] Copy Secret Key → `.env.local`
- [ ] Webhooks → Add endpoint → URL = `http://localhost:3000/api/stripe/webhook`
      (we'll update to prod URL after Vercel deploy)
- [ ] Select events: `customer.subscription.created`,
      `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copy the webhook signing secret → `.env.local`

## Local dev (15 min)

- [ ] `npm run dev`
- [ ] Open `http://localhost:3000` → see landing
- [ ] Open `http://localhost:3000/dashboard` → should redirect home (not logged in)
- [ ] In Supabase dashboard, manually insert a test user via Auth → Users →
      Invite user (your email)
- [ ] Click the magic link → should land on `/dashboard` → see "No projects yet"

## Vercel deploy (30 min)

- [ ] Push to GitHub
- [ ] Import project on Vercel
- [ ] Add all env vars from `.env.local` (copy the exact names)
- [ ] Deploy → wait for green
- [ ] In Supabase → Auth → URL Configuration → add your Vercel URL +
      `/api/auth/callback` to Redirect URLs
- [ ] In Stripe → Webhooks → update endpoint to your Vercel URL
- [ ] Test magic-link flow on prod

## Done when

- [ ] `karmora.vercel.app/dashboard` redirects to `/` when logged out
- [ ] Magic link flow works in prod
- [ ] Logged-in user sees empty dashboard on prod
- [ ] No console errors
- [ ] Commit with message: `session 1: skeleton + supabase + stripe plumbing`

## Then: STOP

Do not start Session 2 in the same sitting. Close the laptop. The win is real.
Post on X that Karmora scaffold is live — no fabricated metrics, just the
honest "Session 1 done, scanner next week".
