# Moderns Milk — Admin Console (`@moderns-milk/web`)

A modern, shadcn/ui-inspired operational admin panel for the Moderns Milk
platform. Built greenfield in **Next.js (App Router) + TypeScript**, wired to
the existing NestJS API. **No backend, API contract, or business logic was
changed** — this app only consumes the existing endpoints.

## Stack

- **Next.js 15** App Router, React 19, **strict TypeScript**
- **Tailwind CSS** + **shadcn/ui patterns** (Radix primitives, CVA) — real
  web components following the shadcn architecture and design tokens
- **TanStack Query** for caching / memoized data fetching
- **Zod contracts reused** from `@moderns-milk/contracts` (single source of
  truth for API types — the UI can never drift from the contract)
- **Inter** typeface

## How it talks to the API (no CORS change needed)

The browser only ever calls the Next.js origin. `next.config.mjs` rewrites
`/bff/*` → `${API_ORIGIN}/api/v1/*`, so the API's `origin:false` CORS policy is
never exercised and the backend needs no changes.

```
Browser ──/bff/orders──▶ Next.js (proxy) ──/api/v1/orders──▶ NestJS API
```

## Run it

```bash
# from the repo root — infra + API first (see root README)
npm run infra:up
npm run db:migrate && npm run db:seed
npm run dev --workspace @moderns-milk/api      # API on :4000

# then the admin panel
cp apps/web/.env.example apps/web/.env          # optional; defaults to :4000
npm run dev --workspace @moderns-milk/web       # web on :3000
```

Open http://localhost:3000. Sign in with a seeded number — e.g.
`+910000000001` (Admin). In dev the OTP is printed to the **API** server log.

## What's implemented (scoped to existing APIs)

| Module     | Screen(s)                                   | API used                            |
| ---------- | ------------------------------------------- | ----------------------------------- |
| Auth       | Phone + OTP login, refresh, logout          | `/auth/otp/*`, `/auth/refresh`      |
| Dashboard  | KPI cards, 7-day trend, status mix, recent  | `/orders`, `/catalog/products`      |
| Orders     | List (search/filter), detail, approve/reject| `/orders`, `/orders/review`         |
| Products   | List (search/category/status filters)       | `/catalog/products`                 |

Dashboard figures are **presentation-only aggregations** of values the API
already computed — no money or quantity is ever recomputed client-side.

## Design system

Tokens live in `tailwind.config.ts` + `src/app/globals.css` (the spec palette,
radii, and spacing). Reusable primitives are in `src/components/ui`. Layout
chrome is in `src/components/layout`. Feature logic lives under `src/features`.

## Scripts

```bash
npm run dev        # next dev (:3000)
npm run build      # production build (typecheck + lint gated)
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```
