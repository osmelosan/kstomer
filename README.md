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
- 📊 **AI-assisted insights** — Claude tool-calling agent diagnoses and next steps on the Dashboard (including an AI-suggested prospects card), Tasks, Analytics, and Resellers pages
- 🤝 **Reseller / portfolio management** — track partners and their pipelines
- 🏢 **Multi-organization support** — switch between companies, with a guided onboarding flow
- 📥 **CSV contact import** — bulk-import contacts from onboarding or the Contacts page, with duplicate-email detection
- 💳 **Built-in billing** — Stripe Checkout, embedded checkout, billing portal, and subscription management
- 🌍 **Multi-language** — English, Spanish and French, with IP-based auto-detection

## Tech stack

| Layer | Stack |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (file-based routing, SSR), React 19, Vite 8, Nitro (Cloudflare target) |
| **UI** | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (new-york style) on Radix UI primitives, `lucide-react`, `recharts` |
| **Data & forms** | TanStack Query, `react-hook-form` + `zod` |
| **Backend** | [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security |
| **Payments** | [Stripe](https://stripe.com) SDK, used directly (no gateway abstraction) |
| **AI** | Claude (`@anthropic-ai/sdk`), called directly — tool-calling agent loop, no gateway abstraction |
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
│   ├── api/cron/warm-ai-cache.ts       # Vercel Cron: pre-warm Tasks AI insight cache
│   └── _authenticated/      # Dashboard, kanban, contacts, tasks,
│                             # analytics, resellers, archives, settings
├── components/               # App shell, command palette, checkout UI, ...
│   └── ui/                   # shadcn/ui primitives
├── hooks/                    # use-tasks, use-subscription, use-organizations, ...
├── lib/                      # pricing-plans, stripe, i18n, utils
│   ├── crm-ai-tools.server.ts       # Shared tool definitions for the AI insights cards
│   ├── dashboard-ai.functions.ts    # AI insights server fn for the Dashboard
│   ├── tasks-ai.functions.ts        # AI insights server fn for Tasks
│   ├── analytics-ai.functions.ts    # AI insights server fn for Analytics
│   ├── resellers-ai.functions.ts    # AI insights server fn for Resellers
│   ├── prospects-ai.functions.ts    # AI-suggested prospects card (Dashboard)
│   └── csv-contacts.ts              # CSV parsing/validation for bulk contact import
├── integrations/supabase/    # Browser + server Supabase clients, auth, DB types
└── assets/
supabase/
└── migrations/                # SQL migrations
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
| `PAYMENTS_SANDBOX_WEBHOOK_SECRET` | Vercel only | Stripe webhook signing secret (test mode) — verifies `/api/public/payments/webhook` requests |
| `PAYMENTS_LIVE_WEBHOOK_SECRET` | Vercel only | Stripe webhook signing secret (live mode) |
| `ANTHROPIC_API_KEY` | Vercel only | Server-only secret — Claude API key used by the Dashboard, Tasks, Analytics, Resellers, and Prospects AI insights functions |
| `CRON_SECRET` | Vercel only | Authenticates the Vercel Cron request that hits `/api/cron/warm-ai-cache` |
| `SUPABASE_PROJECT_ID` / `VITE_SUPABASE_PROJECT_ID` | `.env` (committed) | Supabase CLI project ref (server / client) |

## Database

Backed by Supabase Postgres. All tables have Row Level Security enabled, scoped per-organization (or per-user for account-level tables). Schema changes live as SQL migrations in `supabase/migrations/`.

`profiles` (`id`, `email`, `full_name`, `avatar_url`, `phone`) is populated automatically on signup via an `on_auth_user_created` trigger on `auth.users`.

Kanban, Contacts, Dashboard, Analytics, Resellers, Archives, Tasks, and billing all read and write real Supabase data — none of the CRM pages render static/mock data anymore:

| Area | Tables |
|---|---|
| **Core CRM** | `contacts` (pipeline card / stage), `subscription_details`, `notes`, `note_edit_history`, `stage_history` |
| **Resellers** | `resellers`, `reseller_contacts`, `reseller_contact_history` |
| **Org & ops** | `organizations`, `profiles`, `user_roles`, `tasks`, `reminders` |
| **Billing** | `subscriptions` |
| **AI** | `ai_insight_cache`, `ai_insights`, `ai_prompt_cache`, `agent_logs` |

`ai_insights`, `ai_prompt_cache`, `user_roles`, and `agent_logs` are currently empty — reserved for planned (V2) features rather than dead schema.

## Pricing

Plans are defined in [`src/lib/pricing-plans.ts`](src/lib/pricing-plans.ts) and billed in EUR via Stripe. Price IDs are Stripe **lookup keys** — matching lookup keys must exist in the Stripe dashboard for each price.

| Plan | Monthly | Yearly (per month) | Companies | Highlights |
|---|---|---|---|---|
| **Starter** | €17 | €13 | 1 | Solo use, smart pipeline & reminders, personalized AI dashboard |
| **Expansion** ⭐ | €37 | €28 | Unlimited | Multi-company, unlimited pipelines, advanced AI portfolio analysis |
| **Empire** | €67 | €31 | Unlimited | Up to 5 users, manager views & team KPIs, permissions and audit log |

All plans include a 14-day free trial.

## Billing & background jobs

- **Checkout & portal** — `createCheckoutSession` creates a Stripe embedded checkout session (price resolved by lookup key); `createPortalSession` opens the Stripe Billing Portal for existing subscribers.
- **Webhook** — `src/routes/api/public/payments/webhook.ts` handles `customer.subscription.created/updated/deleted`, verifies the signature (HMAC via `PAYMENTS_SANDBOX_WEBHOOK_SECRET` / `PAYMENTS_LIVE_WEBHOOK_SECRET`), and upserts into the `subscriptions` table. Sandbox vs. live is selected via a `?env=` query param on the endpoint.
- **AI insight caching** — Dashboard/Tasks/Analytics/Resellers/Prospects insight cards are cached in `ai_insight_cache` and only regenerated once per day (or on manual refresh), to avoid calling Claude on every page load.
- **Vercel Cron** (`vercel.json`) — a daily job hits `/api/cron/warm-ai-cache` (guarded by `CRON_SECRET`) to pre-warm the Tasks AI cache; other cards stay lazy-cached to avoid mixing data across tenants under RLS.
- **AI model routing** — Dashboard/Tasks/Analytics/Resellers use Claude Haiku 4.5 (summarizing already-fetched data); Prospects uses Sonnet 5 (web-search-grounded reasoning). System prompts use prompt caching (`cache_control: ephemeral`) to reduce token cost.

## Deployment

- **Platform:** [Vercel](https://vercel.com) — all deploys go through Vercel.
- **Editor:** the repo is also connected to [Lovable.dev](https://lovable.dev) for visual/AI-assisted editing; git remains the source of truth.
- **Workflow:** changes are pushed directly to `main` — no long-lived feature branches.

