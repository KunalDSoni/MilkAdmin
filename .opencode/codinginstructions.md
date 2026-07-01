# Resume Context — Milk Admin

## Current State
- **Branch**: `main` (pushed to `origin`)
- **Last commit**: `HEAD` — `feat: Epic 2 field app features + standing orders admin`
- **Working tree**: clean, nothing to commit

## What Was Completed

### Epic 1 — Foundations (✅ Complete)
- Password auth (bcrypt) with `login` and `changePassword` endpoints — `apps/api/src/auth/`
- MinIO file upload / download / presigned URL module — `apps/api/src/file/`
- Zod validation schemas for auth + file in `packages/contracts/src/`
- Prisma migration `20260701045426_add_password_hash` — adds `passwordHash` to User model
- Seed script sets bcrypt hash `Moderns@2026` for all seeded users — `packages/database/src/seed.ts`
- Onboarding service sets initial password on user creation — `apps/api/src/onboarding/`
- Env validation for MinIO + bcrypt config — `apps/api/src/config/env.validation.ts`

### Epic 2 — Field App (✅ Complete)
- **Payment logging UI in MilkApp** — `MilkApp/src/features/payment/` (schemas, api, hooks) + screens at `MilkApp/src/app/(app)/payments/index.tsx` (list) and `new.tsx` (create). Dashboard quick action added.
- **Sales visit history screen** — `MilkApp/src/app/(app)/sales-visits/index.tsx` with list view. Existing create flow preserved. Dashboard navigates to history.
- **Standing orders admin page** — `Milk Admin/apps/web/src/app/(app)/standing-orders/page.tsx` with create/edit/delete dialog at `features/standing-orders/`. Nav item added in sidebar.
- **Password login UI in MilkApp** — Login screen updated with OTP/Password toggle. `loginWithPassword` API and hook added. Mock mode password: `Moderns@2026`.
- **Cutoff auto-lock cron job** — `CutoffSchedulerService` at `apps/api/src/ordering/cutoff-scheduler.service.ts` polls every 60s (configurable via `CUTOFF_POLL_MS` env var) with Redis lock for multi-instance safety. Registered in `OrderingModule`.

## Architecture
- **Backend**: NestJS (port 4000) at `Milk Admin/apps/api/`
- **Database**: PostgreSQL via Prisma, schema at `packages/database/prisma/schema.prisma`
- **Contracts**: Zod schemas at `packages/contracts/src/`, re-exported from `index.ts`
- **Frontends**:
  - MilkApp (Expo/RN) at `MilkApp/`
  - Admin Web (Next.js) at `Milk Admin/apps/web/`
- **Infra**: MinIO at localhost:9000 in docker-compose

## What to Do Next (Epic 3 — Admin Polish)
- Edit distributor/retailer records inline
- Filters (status, area, date range) on list pages
- Force logout user
- Reconcile unlinked users
- Dropdown selects for relation fields
- Also: file upload UI in MilkApp, file upload UI in Admin Web

## Relevant Files & Paths (Epic 2 additions)
| Area | Path |
|------|------|
| Payment schemas (MilkApp) | `MilkApp/src/features/payment/schemas.ts` |
| Payment API (MilkApp) | `MilkApp/src/features/payment/api.ts` |
| Payment hooks (MilkApp) | `MilkApp/src/features/payment/hooks.ts` |
| Payment list screen | `MilkApp/src/app/(app)/payments/index.tsx` |
| Payment create screen | `MilkApp/src/app/(app)/payments/new.tsx` |
| Sales visit list screen | `MilkApp/src/app/(app)/sales-visits/index.tsx` |
| Standing orders admin page | `Milk Admin/apps/web/src/app/(app)/standing-orders/page.tsx` |
| Standing orders feature hook | `Milk Admin/apps/web/src/features/standing-orders/use-standing-orders.ts` |
| Standing orders dialog | `Milk Admin/apps/web/src/features/standing-orders/standing-order-dialog.tsx` |
| Standing orders API (web) | `Milk Admin/apps/web/src/lib/api.ts` (standingOrders section) |
| Standing orders nav item | `Milk Admin/apps/web/src/lib/nav.ts` |
| Cutoff scheduler | `Milk Admin/apps/api/src/ordering/cutoff-scheduler.service.ts` |
| Login screen (password + OTP) | `MilkApp/src/app/(auth)/login.tsx` |
| Auth hooks (password login) | `MilkApp/src/features/auth/hooks.ts` |
| Auth API (password login) | `MilkApp/src/features/auth/api.ts` |
| Dashboard quick actions | `MilkApp/src/app/(app)/(tabs)/index.tsx` |
| App layout (routes) | `MilkApp/src/app/(app)/_layout.tsx` |

## Build & Run
```bash
cd "Milk Admin/apps/api"
npx nest build
node dist/main.js
# Server starts on :4000 with /api/v1/* routes
```

## Users (seeded)
All users have password `Moderns@2026` (bcrypt-hashed). Phone numbers in seed script at `packages/database/src/seed.ts`.

## Key Decisions
- OTP replaced by password as primary auth; OTP kept as fallback
- `z.coerce.boolean()` doesn't work for `'false'` string; use `z.string().default('false').transform(v => v === 'true' || v === '1')`
- MinIO bucket auto-created via `ensureBucket()` on first upload
- File upload limit: 10 MB via MulterModule
- Cutoff scheduler polling interval configurable via `CUTOFF_POLL_MS` env var (default 60s)
- Redis lock prefix `lock:cutoff-sweep` for multi-instance safety
- Standing orders nav visible to ADMIN, SALES_HEAD, SALES_OFFICER, DISTRIBUTOR
- Switch to `main` branch before starting new work
