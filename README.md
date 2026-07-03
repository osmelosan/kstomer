<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/kstomer-horizontal-on-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="public/kstomer-horizontal-on-light.png">
  <img alt="Kstomer" src="public/kstomer-horizontal-on-light.png" width="360">
</picture>

### The efficient, precise, no-noise CRM for solopreneurs.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%2B%20Router-ff4154?logo=react-router&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635bff?logo=stripe&logoColor=white)](https://stripe.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## About

Kstomer helps solo founders and consultants take control of their sales in minutes: a Kanban pipeline, a unified contact book, task reminders, and lightweight analytics — all in one tool, built for speed, clarity and trust. No bloated enterprise CRM, no noise — just what a one-person sales operation actually needs.

## Features

- 🗂️ **Kanban pipeline** — drag-and-drop deal tracking (`@dnd-kit`)
- 📇 **Unified contact book** — one place for every prospect and client
- ✅ **Tasks & follow-up reminders** — never drop a deal
- 📊 **AI-assisted analytics** — portfolio and revenue insights powered by the Vercel AI SDK
- 🤝 **Reseller / portfolio management** — track partners and their pipelines
- 🏢 **Multi-organization support** — switch between companies, with a guided onboarding flow
- 💳 **Built-in billing** — Stripe Checkout, embedded checkout, and subscription management
- 🌍 **Multi-language** — English, Spanish and French, with IP-based auto-detection

## Tech stack

| Layer | Stack |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (file-based routing, SSR), React 19, Vite 8, Nitro (Cloudflare target) |
| **UI** | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (new-york style) on Radix UI primitives, `lucide-react`, `recharts` |
| **Data & forms** | TanStack Query, `react-hook-form` + `zod` |
| **Backend** | [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security |
| **Payments** | [Stripe](https://stripe.com) SDK, used directly (no gateway abstraction) |
| **AI** | Vercel AI SDK (`ai`, `@ai-sdk/openai-compatible`) via the Lovable AI gateway |
| **i18n** | `i18next` / `react-i18next` (en, es, fr) |
| **Tooling** | TypeScript (strict), ESLint 9 (flat config), Prettier, Bun |

## Project structure

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── index.tsx            # Marketing home page
│   ├── pricing.tsx          # Pricing page
│   ├── auth*.tsx            # Sign in / reset password / OAuth callback
│   ├── checkout.return.tsx  # Post-Stripe-checkout return
│   ├── api/public/payments/webhook.ts  # Stripe webhook handler
│   └── _authenticated/      # Dashboard, kanban, contacts, tasks,
│                             # analytics, resellers, archives, settings
├── components/               # App shell, command palette, checkout UI, ...
│   └── ui/                   # shadcn/ui primitives
├── hooks/                    # use-tasks, use-subscription, use-organizations, ...
├── lib/                      # pricing-plans, stripe, i18n, AI functions, utils
├── integrations/supabase/    # Browser + server Supabase clients, auth, DB types
└── assets/
supabase/
└── migrations/                # SQL migrations (profiles, organizations, tasks, subscriptions, user_roles)
public/                        # Brand assets, favicon, llms.txt
```

## Getting started

**Prerequisites:** [Bun](https://bun.sh) (preferred) or Node.js 20+

```bash
# 1. Install dependencies
bun install
# or: npm install

# 2. Configure environment variables (see below) in .env / .env.development

# 3. Run the dev server
bun run dev
```

The app runs at `http://localhost:3000` by default.

## Available scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Preview a production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format the codebase with Prettier |

> No automated test suite exists yet.

## Environment variables

Non-secret config and empty placeholders live in the committed `.env`; secrets are set in the **Vercel dashboard** (Settings → Environment Variables), not committed to the repo.

| Variable | Where it's set | Notes |
|---|---|---|
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | `.env` (committed) | Supabase project URL (server / client) |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (committed) | Supabase anon/public key (server / client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only | Server-only secret — used by the Stripe webhook handler and the privileged server-side Supabase client |
| `STRIPE_SECRET_KEY` | Vercel + local `.env.development` | Test key: `sk_test_…` |
| `STRIPE_LIVE_SECRET_KEY` | Vercel only | Live key: `sk_live_…` (when going live) |
| `VITE_PAYMENTS_CLIENT_TOKEN` | `.env.development` / Vercel | Stripe publishable key (`pk_test_…` or `pk_live_…`) — sandbox vs. live is inferred from this prefix |
| `LOVABLE_API_KEY` | Vercel only | Server-only secret — powers the AI gateway used by analytics and reseller AI functions |

## Database

Backed by Supabase Postgres. Every table (`profiles`, `user_roles`, `organizations`, `subscriptions`, `tasks`) has Row Level Security enabled with per-user/per-owner policies. Schema changes live as SQL migrations in `supabase/migrations/`.

## Pricing

Plans are defined in [`src/lib/pricing-plans.ts`](src/lib/pricing-plans.ts) and billed in EUR via Stripe. Price IDs are Stripe **lookup keys** — matching lookup keys must exist in the Stripe dashboard for each price.

| Plan | Monthly | Yearly (per month) | Companies | Highlights |
|---|---|---|---|---|
| **Starter** | €17 | €13 | 1 | Solo use, smart pipeline & reminders, personalized AI dashboard |
| **Expansion** ⭐ | €37 | €28 | Unlimited | Multi-company, unlimited pipelines, advanced AI portfolio analysis |
| **Empire** | €67 | €31 | Unlimited | Up to 5 users, manager views & team KPIs, permissions and audit log |

All plans include a 14-day free trial.

## Deployment

- **Platform:** [Vercel](https://vercel.com) — all deploys go through Vercel.
- **Editor:** the repo is also connected to [Lovable.dev](https://lovable.dev) for visual/AI-assisted editing; git remains the source of truth.
- **Workflow:** changes are pushed directly to `main` — no long-lived feature branches.

