import { describe, it, expect } from 'vitest';
import { isWindowOpen, shouldLock } from '../src/ordering/domain/cutoff';

const cutoff = new Date('2026-06-24T18:00:00Z');
const before = new Date('2026-06-24T17:59:59Z');
const after = new Date('2026-06-24T18:00:01Z');

describe('order window cutoff', () => {
  it('accepts orders before cutoff while OPEN', () => {
    expect(isWindowOpen({ status: 'OPEN', cutoffAt: cutoff }, before)).toBe(true);
  });

  it('rejects orders at or after cutoff', () => {
    expect(isWindowOpen({ status: 'OPEN', cutoffAt: cutoff }, cutoff)).toBe(false);
    expect(isWindowOpen({ status: 'OPEN', cutoffAt: cutoff }, after)).toBe(false);
  });

  it('rejects orders on a non-OPEN window regardless of time', () => {
    expect(isWindowOpen({ status: 'LOCKED', cutoffAt: cutoff }, before)).toBe(false);
  });

  it('flags an OPEN window past cutoff for auto-lock', () => {
    expect(shouldLock({ status: 'OPEN', cutoffAt: cutoff }, after)).toBe(true);
    expect(shouldLock({ status: 'OPEN', cutoffAt: cutoff }, before)).toBe(false);
    expect(shouldLock({ status: 'LOCKED', cutoffAt: cutoff }, after)).toBe(false);
  });
});
