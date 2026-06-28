# Kstomer – project notes for Claude

## Deployment
- **Platform: Vercel** — all deploys go through Vercel.
- Environment variables (secrets) are set in the **Vercel dashboard** (Settings → Environment Variables), not committed to the repo.
- The `.env` file in the repo holds non-secret config and empty placeholders for secrets.

## Environment variables
| Variable | Where to set | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Vercel + local `.env.development` | Test key: `sk_test_…` |
| `STRIPE_LIVE_SECRET_KEY` | Vercel only | Live key: `sk_live_…` (when going live) |
| `VITE_PAYMENTS_CLIENT_TOKEN` | `.env.development` / Vercel | Stripe publishable key (`pk_test_…` or `pk_live_…`) |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | `.env` (committed) | Already set |

## Stripe
- Uses the Stripe SDK directly (no Lovable gateway).
- Sandbox environment is inferred from the publishable key prefix (`pk_test_` → sandbox, `pk_live_` → live).
- Price IDs in `src/lib/pricing-plans.ts` are Stripe **lookup keys** — make sure matching lookup keys are configured in the Stripe dashboard for each price.

## Git workflow
- Push all changes directly to `main`. Do not create feature branches or pull requests unless explicitly asked.
- Before starting any work: `git fetch origin main && git checkout main && git pull origin main` to ensure you are on the latest commit.
