# Moderns Milk — Dairy Distribution & Ordering Platform

Monorepo for the Moderns Milk platform. **Slice 1** delivers the foundation +
ordering core (see `docs/superpowers/specs/`).

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL + Redis
- **Admin web:** Next.js (App Router) + TypeScript + shadcn/ui patterns
- **Monorepo:** npm workspaces + Turborepo
- **Validation/contracts:** Zod (shared `@moderns-milk/contracts`)
- Mobile (Expo) app lands in a later slice.

## Layout

```
apps/api              NestJS backend (auth, catalog, ordering)
apps/web              Next.js admin console (see apps/web/README.md)
packages/database     Prisma schema, client, seed
packages/contracts    Zod schemas + shared types
packages/config       shared tsconfig
```

The admin console talks to the API through a same-origin proxy (`/bff/*` →
`/api/v1/*`), so the backend's CORS policy is unchanged. See
[`apps/web/README.md`](apps/web/README.md) to run it.

## Getting started

```bash
cp .env.example .env          # dev defaults; replace secrets in real envs
npm install
npm run infra:up              # postgres + redis + minio (Docker)
npm run db:generate
npm run db:migrate            # creates the schema
npm run db:seed               # loads the Moderns Milk catalog + demo org
npm run dev --workspace @moderns-milk/api
```

API serves on `http://localhost:4000/api/v1`. Health: `GET /api/v1/health`.

### Dev auth flow (phone + OTP)

```
POST /api/v1/auth/otp/request   { "phone": "+910000000003" }
# OTP is printed to the API log in dev (SMS_PROVIDER=console)
POST /api/v1/auth/otp/verify    { "phone": "+910000000003", "code": "123456" }
# -> { accessToken, refreshToken, expiresIn }
```

## Tests

```bash
npm run test --workspace @moderns-milk/api   # domain unit tests (no DB needed)
```

Covered: order state machine, cutoff enforcement, exception-based auto-approval,
and object-level authorization (anti-IDOR).

## Correctness guarantees baked in

- Money = `Decimal(12,2)`, quantities = `Decimal(12,3)` — never floats.
- Order transitions go through a single state machine; illegal moves throw.
- Tenant isolation enforced in the data layer + object-level guards.
- Append-only ledger and audit log for financial / approval actions.
