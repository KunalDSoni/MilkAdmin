import { describe, it, expect } from 'vitest';
import {
  canAccessDistributorResource,
  canAccessRetailerResource,
  type ActorScope,
} from '../src/common/authz/scope';

const admin: ActorScope = { role: 'ADMIN' };
const salesHead: ActorScope = { role: 'SALES_HEAD' };
const distA: ActorScope = { role: 'DISTRIBUTOR', distributorId: 'A' };
const distB: ActorScope = { role: 'DISTRIBUTOR', distributorId: 'B' };
const retailerA1: ActorScope = {
  role: 'RETAILER',
  retailerId: 'r1',
  distributorId: 'A',
};

describe('object-level authorization (anti-IDOR)', () => {
  it('lets org-wide roles see any distributor', () => {
    expect(canAccessDistributorResource(admin, 'A')).toBe(true);
    expect(canAccessDistributorResource(salesHead, 'B')).toBe(true);
  });

  it('confines distributor staff to their own org', () => {
    expect(canAccessDistributorResource(distA, 'A')).toBe(true);
    expect(canAccessDistributorResource(distA, 'B')).toBe(false);
    expect(canAccessDistributorResource(distB, 'A')).toBe(false);
  });

  it('blocks retailers from distributor-scoped resources', () => {
    expect(canAccessDistributorResource(retailerA1, 'A')).toBe(false);
  });

  it('lets a retailer access only their own data', () => {
    expect(canAccessRetailerResource(retailerA1, 'r1', 'A')).toBe(true);
    expect(canAccessRetailerResource(retailerA1, 'r2', 'A')).toBe(false);
  });

  it('lets distributor staff access retailers in their org only', () => {
    expect(canAccessRetailerResource(distA, 'r1', 'A')).toBe(true);
    expect(canAccessRetailerResource(distB, 'r1', 'A')).toBe(false);
  });

  it('prevents cross-distributor retailer access (the classic IDOR)', () => {
    const retailerB = { role: 'RETAILER', retailerId: 'r9', distributorId: 'B' } as const;
    expect(canAccessRetailerResource(retailerB, 'r1', 'A')).toBe(false);
  });
});
