# Resume Context — Milk Admin

## Current State
- **Branch**: `main` (pushed to `origin`)
- **Last commit**: `HEAD` — `feat: Epic 3 admin polish`
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

### Epic 3 — Admin Polish (✅ Complete)
- **Force logout user** — `POST /admin/users/:userId/force-logout` endpoint in `apps/api/src/admin/admin.controller.ts`. Force logout button (LogOut icon) on each row in the users table at `apps/web/src/app/(app)/users/page.tsx`. Uses `TokenService.revokeAll()` to invalidate all refresh tokens.
- **Reconcile unlinked users** — `GET /admin/users/unlinked` lists SALES_OFFICER + DISTRIBUTOR users with no `distributorId`. `POST /admin/users/:userId/link` assigns them to a distributor & revokes tokens for re-login. Frontend `ReconcileDialog` at `apps/web/src/features/users/reconcile-dialog.tsx` shows list + distributor selector dropdown.
- **Filters on list pages** — Distributors: region + status dropdowns. Payments: status + distributor + date range (native date inputs). Sales visits: outletType + date range (native date inputs). Backend extended with `dateFrom`/`dateTo` query params on `GET /payments` and `GET /sales-visits`, plus `outletType` on sales-visits.
- **Distributor inline edit** — `PATCH /admin/distributors/:id` in admin controller/service. Frontend `DistributorEditDialog` at `apps/web/src/features/network/distributor-edit-dialog.tsx` with name/code/region/address/status fields, opened via Pencil icon on each row in the distributors page.
- Admin module now imports `AuthModule` to access `TokenService`.

## Architecture
- **Backend**: NestJS (port 4000) at `Milk Admin/apps/api/`
- **Database**: PostgreSQL via Prisma, schema at `packages/database/prisma/schema.prisma`
- **Contracts**: Zod schemas at `packages/contracts/src/`, re-exported from `index.ts`
- **Frontends**:
  - MilkApp (Expo/RN) at `MilkApp/`
  - Admin Web (Next.js) at `Milk Admin/apps/web/`
- **Infra**: MinIO at localhost:9000 in docker-compose

## What to Do Next (Epic 4 — File Upload UX)
- File upload UI in MilkApp (payment proof screenshots, profile photos)
- File upload UI in Admin Web (payment verification, document upload)
- Presigned URL handling for direct uploads from frontend
- Retailer filters (status, date range, area) on admin retailers page
- Bulk operations (export to CSV, batch status updates)

## Relevant Files & Paths (Epic 3 additions)
| Area | Path |
|------|------|
| Force logout endpoint | `apps/api/src/admin/admin.controller.ts` (line ~35) |
| Force logout service method | `apps/api/src/admin/admin.service.ts` `forceLogout()` |
| Force logout button (users page) | `apps/web/src/app/(app)/users/page.tsx` |
| Unlinked users endpoint | `apps/api/src/admin/admin.controller.ts` |
| Unlinked users service method | `apps/api/src/admin/admin.service.ts` `listUnlinkedUsers()` |
| Link user endpoint | `apps/api/src/admin/admin.controller.ts` |
| Link user service method | `apps/api/src/admin/admin.service.ts` `linkUser()` |
| Reconcile dialog | `apps/web/src/features/users/reconcile-dialog.tsx` |
| Distributor edit endpoint | `apps/api/src/admin/admin.controller.ts` |
| Distributor edit service method | `apps/api/src/admin/admin.service.ts` `updateDistributor()` |
| Distributor edit dialog | `apps/web/src/features/network/distributor-edit-dialog.tsx` |
| Payment filters (date range backend) | `apps/api/src/payment/payment.controller.ts` + `payment.service.ts` |
| Sales visit filters (date, outletType backend) | `apps/api/src/sales-visit/sales-visit.controller.ts` + `sales-visit.service.ts` |
| Distributor page filters | `apps/web/src/app/(app)/distributors/page.tsx` |
| Payments page filters | `apps/web/src/app/(app)/payments/page.tsx` |
| Sales visits page filters | `apps/web/src/app/(app)/sales-visits/page.tsx` |
| Admin module imports AuthModule | `apps/api/src/admin/admin.module.ts` |

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
- Force logout revokes ALL refresh tokens for that user via `TokenService.revokeAll()`
- Linking a user to a distributor also revokes their tokens so JWT picks up new `distributorId`
