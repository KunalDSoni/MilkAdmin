# Moderns Milk — Slice 1: Foundation + Ordering Core (Design)

**Date:** 2026-06-24
**Status:** Approved
**Company:** Moderns Milk (modernsmilk.com) — Dairy Distribution & Ordering Platform

## Context

Greenfield. This is slice 1 of a multi-slice platform (auth, catalog, pricing,
ordering, fulfillment, ledger, returnables, notifications, reporting). This slice
builds the spine everything else depends on: data model, auth, scoped
authorization, catalog, and the ordering core.

## Locked decisions

- **Auth:** Phone + OTP for ALL roles. Staff permissions scoped tightly to
  compensate for the weaker single factor.
- **Web:** Single Next.js app, role-gated (Admin + Sales + Distributor). *Not in
  this slice.*
- **Design system:** Shadcn UI primary; TailAdmin for layout inspiration only.
  *Not in this slice.*
- **Package manager:** npm workspaces (pnpm unavailable on host) + Turborepo.

## Monorepo layout

```
apps/
  api/                 NestJS backend (only running app this slice)
packages/
  database/            Prisma schema, client, migrations, seed
  contracts/           Zod schemas + inferred TS types (single source of truth)
  config/              shared tsconfig / eslint
```

## Backend modules (this slice)

- **auth** — phone+OTP login (all roles); JWT access (15 min) + rotating refresh
  token in Redis (revocable, reuse detection). OTP rate-limited per phone + per IP,
  6-digit, 5-min expiry, max 5 attempts with exponential lockout.
- **common** — global scoped-authorization guard (object-level, anti-IDOR), Prisma
  tenant-scope client extension, audit-log interceptor, Zod validation pipe.
- **catalog** — products, categories, UOM, HSN/tax fields.
- **ordering** — OrderWindow (cutoff + auto-lock), StandingOrder (recurring →
  materialized draft orders via BullMQ scheduled job), Order + OrderItem with
  multi-stage quantities and an explicit state machine. Auto-approve within
  tolerance + credit check; exception routing to humans.
- **ledger / pricing** — schema only this slice (Decimal money, append-only
  LedgerEntry, effective-dated PriceList). Behavior in slice 2.

## Order state machine

`DRAFT → SUBMITTED → APPROVED → IN_PRODUCTION → DISPATCHED → DELIVERED → SETTLED`
plus `CANCELLED`, `REJECTED`. Transitions are role-guarded and audit-logged.
Illegal transitions throw.

## Non-negotiable correctness rules

- All money = `Decimal` / `numeric(12,2)`; quantities = `numeric`. No floats.
- `LedgerEntry` append-only; `AuditLog` on every financial / approval / state
  transition.
- `Order` / `OrderItem` designed for `deliveryDate` range partitioning later.
- Every read/write passes the scope guard. IDOR tests are part of the slice.

## Local infra

`docker-compose.yml`: Postgres + Redis + MinIO. `.env.example` only; secrets never
committed.

## Testing

- Unit (heavy): state-machine transitions, cutoff logic, auto-approval tolerance,
  scope guard.
- Integration: auth + order lifecycle against real Postgres (Testcontainers).
- IDOR suite: cross-distributor access denial.

## Explicitly NOT in this slice

Ledger/payment behavior, returnables reconciliation, short-supply allocation, GST
invoicing, web portal, mobile app, monitoring stack.
