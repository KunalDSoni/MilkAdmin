import { OrderStatus } from '@moderns-milk/contracts';

/**
 * The single source of truth for legal order transitions. Pure and
 * dependency-free so it is trivially unit-testable. Any state change in the
 * ordering service MUST go through `assertTransition`.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IN_PRODUCTION', 'CANCELLED'],
  REJECTED: [],
  IN_PRODUCTION: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: ['SETTLED'],
  SETTLED: [],
  CANCELLED: [],
};

export const TERMINAL_STATES: ReadonlySet<OrderStatus> = new Set([
  'REJECTED',
  'SETTLED',
  'CANCELLED',
]);

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export class IllegalOrderTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super(`Illegal order transition: ${from} -> ${to}`);
    this.name = 'IllegalOrderTransitionError';
  }
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalOrderTransitionError(from, to);
  }
}
