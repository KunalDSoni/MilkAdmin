export * from '@prisma/client';
export { Prisma, PrismaClient } from '@prisma/client';

import { PrismaClient } from '@prisma/client';

/**
 * A request scope describes what slice of data the current actor may touch.
 * `distributorId` undefined => unrestricted (ADMIN / SALES_HEAD).
 */
export interface DataScope {
  distributorId?: string;
}

// Models that carry a distributorId column and must be tenant-filtered.
const DISTRIBUTOR_SCOPED_MODELS = new Set([
  'Retailer',
  'Route',
  'OrderWindow',
  'Order',
]);

const READ_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

/**
 * Defense-in-depth tenant isolation. Even if a controller forgets a `where`
 * clause, reads on distributor-scoped models are constrained to the actor's
 * own distributor. This complements (does not replace) the object-level
 * authorization guard in the API layer.
 */
export function scopedPrisma(base: PrismaClient, scope: DataScope) {
  if (!scope.distributorId) return base;
  const distributorId = scope.distributorId;

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (
            DISTRIBUTOR_SCOPED_MODELS.has(model) &&
            READ_OPS.has(operation)
          ) {
            const a = (args ?? {}) as { where?: Record<string, unknown> };
            a.where = { ...(a.where ?? {}), distributorId };
            return query(a);
          }
          return query(args);
        },
      },
    },
  });
}

let _prisma: PrismaClient | undefined;

/** Singleton base client (unscoped). Scope per-request with `scopedPrisma`. */
export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}
