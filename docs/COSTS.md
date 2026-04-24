# Karmora running costs + pricing

Last updated: 2026-04-24. Assumes scanner runs hourly per project.

## Fixed costs

| Line item                         | Cost       | Notes                       |
| --------------------------------- | ---------- | --------------------------- |
| Hostinger VPS (KVM 2)             | £19.99/mo  | Hosts the hourly scanner.   |
| Hostinger daily backup            | ~£10/mo    | Optional but already paid.  |
| Vercel (Hobby)                    | £0         | Free tier fine until scale. |
| Supabase (Free)                   | £0         | 500MB DB; far from cap.     |
| Webshare proxies (Free 10)        | £0         | 3/6 subs 403 — see TODO.    |
| Clerk (Free)                      | £0         | Under 10k MAU.              |
| Stripe                            | £0 fixed   | 1.5% + 20p per charge (UK). |
| **Total fixed**                   | **~£30**   |                             |

## Variable costs (per active project)

Assumes 24 scans/day, up to 50 candidate posts scored by LLM per scan.

| Line item                          | Per project / month        |
| ---------------------------------- | -------------------------- |
| OpenAI `gpt-4o-mini` — scoring     | ~$0.50 – $1.50 (~£0.40–£1.20) |
| OpenAI `gpt-4o` — opener gen       | ~$0.02 per opener clicked  |
| Supabase storage (leads + raw)     | negligible                 |

Worst-case £1.50/project/month at max scoring volume.

## Pricing model

| Plan  | Price     | Projects | Remove projects | Opener modes           |
| ----- | --------- | -------- | --------------- | ---------------------- |
| Free  | £0        | 1        | No              | Safe only              |
| Pro   | £15/mo    | 5        | Yes             | Safe / Soft / Promo    |

Free-tier guardrails already enforced by `user_can_create_project()` SQL
function. Project removal gated in API + UI by `profiles.plan === 'pro'`.

## Unit economics

- **Breakeven:** 2 Pro subs covers £30 fixed (£30 revenue − £1.50 per-project cost × 2 × 5 max projects = £15 worst case variable, leaving ~£15 margin).
- **At 10 Pro subs:** £150 revenue − £30 fixed − up to £75 OpenAI (very
  worst case, all 50 projects maxed) = **£45 gross margin minimum**.
  Realistically more like £100+ since most users won't max all 5 projects.

## Stripe setup (one-time, before launch)

1. Stripe dashboard → Products → Create product "Karmora Pro"
2. Recurring price: £15 GBP / month
3. Copy the `price_XXX` ID into `STRIPE_PRICE_ID_PRO` in Vercel env vars
4. Developers → Webhooks → add endpoint
   `https://<your-vercel-url>/api/stripe/webhook`, events:
   `customer.subscription.created`, `.updated`, `.deleted`
5. Copy signing secret into `STRIPE_WEBHOOK_SECRET`
6. Customer portal → Settings → enable cancellation, plan switching
