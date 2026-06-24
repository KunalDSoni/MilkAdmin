import { describe, it, expect } from 'vitest';
import {
  ORDER_TRANSITIONS,
  TERMINAL_STATES,
  canTransition,
  assertTransition,
  IllegalOrderTransitionError,
} from '../src/ordering/domain/order-state-machine';

describe('order state machine', () => {
  it('allows the happy-path lifecycle', () => {
    const path = [
      ['DRAFT', 'SUBMITTED'],
      ['SUBMITTED', 'APPROVED'],
      ['APPROVED', 'IN_PRODUCTION'],
      ['IN_PRODUCTION', 'DISPATCHED'],
      ['DISPATCHED', 'DELIVERED'],
      ['DELIVERED', 'SETTLED'],
    ] as const;
    for (const [from, to] of path) {
      expect(canTransition(from, to)).toBe(true);
    }
  });

  it('rejects skipping production', () => {
    expect(canTransition('APPROVED', 'DELIVERED')).toBe(false);
    expect(() => assertTransition('APPROVED', 'DELIVERED')).toThrow(
      IllegalOrderTransitionError,
    );
  });

  it('rejects resurrecting terminal states', () => {
    for (const state of TERMINAL_STATES) {
      expect(ORDER_TRANSITIONS[state]).toHaveLength(0);
    }
  });

  it('allows cancellation up to dispatch but not after', () => {
    expect(canTransition('DRAFT', 'CANCELLED')).toBe(true);
    expect(canTransition('IN_PRODUCTION', 'CANCELLED')).toBe(true);
    expect(canTransition('DISPATCHED', 'CANCELLED')).toBe(false);
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false);
  });

  it('cannot move backwards', () => {
    expect(canTransition('APPROVED', 'DRAFT')).toBe(false);
    expect(canTransition('DELIVERED', 'DISPATCHED')).toBe(false);
  });
});
