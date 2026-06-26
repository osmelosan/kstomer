## Problem
On the `/auth` page, the three tab buttons (Iniciar sesión / Registrarse / Olvidé mi contraseña) overlap because the Spanish "Olvidé mi contraseña" text is too long for a `grid-cols-3` layout. Additionally, the "Forgot password" flow is duplicated: it exists both as a tab trigger and as a text link inside the Sign In form.

## Solution
1. **Remove the "Forgot password" tab trigger** from `TabsList` in `src/routes/auth.tsx`.
2. **Change `grid-cols-3` to `grid-cols-2`** so the remaining "Sign In" and "Sign Up" tabs have enough room.
3. **Keep the `TabsContent value="forgot"`** and the existing `onSwitchForgot` link inside `SignInForm` so users can still access the password-reset flow by clicking the link below the password field.

No other files need changes. The i18n key `auth.forgot` will simply no longer be used on this page (the link uses `auth.forgotLink` instead).

## Verification
- Build passes (`bun run build`).
- The auth page renders two non-overlapping tabs.
- Clicking "¿Olvidaste tu contraseña?" under the password field still shows the forgot-password form.