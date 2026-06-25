import type { OrderStatus } from '@moderns-milk/contracts';
import type { BadgeVariant } from '@/components/ui/badge';

/**
 * Purely presentational mapping of the order state machine to badge styles.
 * The set of statuses and their meaning is owned by the backend; this only
 * decides how each one looks.
 */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  SUBMITTED: { label: 'Submitted', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  IN_PRODUCTION: { label: 'In Production', variant: 'info' },
  DISPATCHED: { label: 'Dispatched', variant: 'info' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  SETTLED: { label: 'Settled', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'muted' },
};

export const ALL_ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];
