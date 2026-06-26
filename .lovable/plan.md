## Problem

The Settings page crashes with:
> cannot add `postgres_changes` callbacks for realtime:subscriptions-self after `subscribe()`

The error originates in `src/hooks/use-subscription.ts`. In React StrictMode (dev), the effect mounts twice. Both mounts call `supabase.channel("subscriptions-self")`, which returns the same already-subscribed channel instance. Adding a `.on("postgres_changes", ...)` listener after `.subscribe()` throws and crashes the route via the error boundary.

## Fix

Update `src/hooks/use-subscription.ts`:

1. Give the realtime channel a unique name per mount (e.g. `subscriptions-self-${crypto.randomUUID()}`) so the second StrictMode mount creates a fresh channel rather than reusing the already-subscribed one.
2. Keep the existing cleanup (`supabase.removeChannel(channel)`) so the unique channel is properly disposed on unmount.

No other files change. This restores the Settings page (and any other consumer of `useSubscription`) without altering behavior.