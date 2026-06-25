## Goal
Let the user edit the monthly revenue goal (currently hardcoded "16 000 €") from the Settings page. The Dashboard footer under the Revenue card should reflect that value, and the progress bar should be computed from it.

## Changes

1. **New `useRevenueGoal` hook** (`src/hooks/use-revenue-goal.ts`)
   - Reads/writes the goal in `localStorage` under `kstomer.revenueGoal` (default `16000`).
   - Exposes `{ goal, setGoal }` with cross-tab sync via the `storage` event.

2. **New Settings section: "Preferences"** (or appended to Profile)
   - Add a `preferences` entry to the `SectionKey` union and sidebar in `src/routes/_authenticated/settings.tsx`.
   - New `PreferencesSection` component with a numeric input "Objectif de revenu mensuel (€)", an inline save button, and a confirmation toast.
   - i18n keys added in FR/EN/ES: `settings.sections.preferences`, `settings.preferences.revenueGoalLabel`, `settings.preferences.revenueGoalHelp`, `settings.preferences.save`, `settings.preferences.saved`.

3. **Dashboard wiring** (`src/routes/_authenticated/dashboard.tsx`)
   - Use `useRevenueGoal()` to get the current goal.
   - Format with `Intl.NumberFormat` based on current locale + `€`.
   - Replace the static `t("dashboard.revenueGoal")` with an interpolated string (`{{goal}}`), e.g. `"Objectif : {{goal}} ce mois"` — update all three locales accordingly.
   - Compute `progress` from `currentRevenue / goal` (keeping the existing mocked `12 450` revenue as the numerator) instead of the hardcoded `75`.

## Out of scope
- Persisting the goal to the backend (kept local-only for now, matching other mock data on the Dashboard).
- Editing the revenue value itself or per-company goals.
