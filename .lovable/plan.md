## Goal
Re-enable Lovable's built-in Stripe payments and restore the previous pricing/checkout/entitlement setup (Starter 17/13€, Expansion 37/28€ "Most popular", Empire 67/31€, 14-day trial on all plans).

## Steps

1. **Re-enable Stripe** via `payments--enable_stripe_payments` (seamless, no API key needed). This recreates the test environment.

2. **Recreate the 3 products** (Starter, Expansion, Empire) with monthly + yearly prices and 14-day trial metadata using `payments--batch_create_product`. New Stripe price IDs will be generated.

3. **Update `src/lib/pricing-plans.ts`** with the new price IDs returned by Stripe.

4. **Verify existing code is intact** (no rewrite needed if files still present):
   - `subscriptions` table + RLS + `has_active_subscription` (migration already applied)
   - Webhook route `/api/public/payments/webhook`
   - Checkout / portal server functions
   - `/pricing` page with monthly/yearly toggle and "Le plus populaire" badge on Expansion
   - `use-subscription` hook, `use-entitlement` hook, hard paywall in `AppShell`
   - Settings → Billing section

   Any file that was removed when Stripe was disconnected will be recreated to match the prior implementation.

5. **Testing guide** (after build):
   - Sign in as a non-tester account
   - Visit `/pricing`, pick a plan → embedded Stripe Checkout opens
   - Use test card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
   - Webhook fires → `subscriptions` row created → paywall lifts → app accessible
   - Settings → Billing shows current plan; "Manage" opens Stripe Portal (open in new tab — preview iframe blocks it)
   - Test decline: `4000 0000 0000 0002`
   - Test 3DS: `4000 0025 0000 3155`
   - Admin can grant `tester` role in Settings → Administration to bypass paywall

## Notes
Test mode only — no real charges. Going live later requires claiming the Stripe account from Settings.
