## Goal
Add a small info icon (`Info` from lucide-react) inside each KPI card on the Reseller Detail page (`/resellers/$slug`) that, on hover/click, shows a tooltip explaining what the metric represents and how it is computed.

## Scope
Only the 4 KPI cards on `src/routes/_authenticated/resellers.$slug.tsx`:
- **Affaires actives** — count of deals in pipeline whose stage is not "Won" or "Lost".
- **Revenu total** — sum of closed-won deal amounts since the partner's start date (`partnerSince`).
- **Niveau (Tier)** — Bronze / Silver / Gold based on cumulative revenue thresholds and tenure.
- **Santé** — composite indicator (Healthy / At risk / Critical) from recent activity, deal velocity, and last contact.

## Implementation

1. **`Kpi` helper component** (same file, lines 199-220)
   - Add optional prop `info?: string`.
   - When set, render a `lucide-react` `Info` icon (12px, muted) next to the label, wrapped in a shadcn `Tooltip` (`@/components/ui/tooltip`). Use existing `TooltipProvider` if not already mounted at the app root — add a local `<TooltipProvider delayDuration={150}>` around the KPI row to be safe.

2. **Wire the 4 KPI usages** to pass localized `info` strings via `t('resellers.detail.kpi.<key>.info')`.

3. **i18n keys** in `src/lib/i18n/{fr,en,es}.ts` under `resellers.detail.kpi`:
   - `activeDeals.info`
   - `revenue.info`
   - `tier.info`
   - `health.info`
   Three short sentences each (FR/EN/ES) describing meaning + calculation basis.

4. **Accessibility**: icon gets `aria-label` = same explanation; button-style trigger so it's keyboard-focusable.

## Out of scope
- Other pages (Dashboard, Analytics) — can be a follow-up if you want the same treatment.
- Changing how the metrics are actually computed.

## Files touched
- `src/routes/_authenticated/resellers.$slug.tsx` (Kpi component + 4 call sites)
- `src/lib/i18n/fr.ts`, `src/lib/i18n/en.ts`, `src/lib/i18n/es.ts`
