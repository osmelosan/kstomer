## Goal
Turn the "Actions prioritaires" rows on the Dashboard into clickable links that navigate to the Tasks page.

## Plan
1. **Update `ActionRow` in `dashboard.tsx`**
   - Add an optional `to` prop.
   - If `to` is provided, render the row as a `<Link>` (from `@tanstack/react-router`) instead of a plain `<div>`.
   - Remove or move the non-functional `MoreHorizontal` button so it does not nest inside the link.
   - Add `cursor-pointer` and ensure hover states remain consistent.

2. **Wire the three action rows**
   - Pass `to="/tasks"` to each `<ActionRow>` instance so clicking any priority action navigates to the Tasks list.

3. **Verify**
   - Run the type check to confirm no router type errors.
   - Confirm clicking a row navigates to `/tasks` in the preview.