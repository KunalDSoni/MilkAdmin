export type WindowStatus = 'OPEN' | 'LOCKED' | 'DISPATCHED' | 'CLOSED';

export interface OrderWindowLike {
  status: WindowStatus;
  cutoffAt: Date;
}

/**
 * A window accepts new/edited orders only while OPEN and before its cutoff.
 * Milk is produced overnight; once cutoff passes, demand must be frozen so
 * production can plan. Pure function — no clock dependency, caller passes now.
 */
export function isWindowOpen(window: OrderWindowLike, now: Date): boolean {
  return window.status === 'OPEN' && now.getTime() < window.cutoffAt.getTime();
}

/** True when an OPEN window has passed its cutoff and should be auto-LOCKED. */
export function shouldLock(window: OrderWindowLike, now: Date): boolean {
  return window.status === 'OPEN' && now.getTime() >= window.cutoffAt.getTime();
}
