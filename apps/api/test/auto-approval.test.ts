import { describe, it, expect } from 'vitest';
import {
  evaluateApproval,
  type ApprovalContext,
} from '../src/ordering/domain/auto-approval';

const base: ApprovalContext = {
  orderTotal: 1000,
  standingTotal: 1000,
  tolerancePct: 0.2,
  accountBalance: 0,
  creditLimit: 20000,
  isNewRetailer: false,
  hasNewSku: false,
};

describe('exception-based auto approval', () => {
  it('auto-approves a routine in-tolerance order within credit', () => {
    expect(evaluateApproval(base)).toEqual({ type: 'AUTO_APPROVE' });
  });

  it('auto-approves right at the tolerance edge', () => {
    expect(evaluateApproval({ ...base, orderTotal: 1200 })).toEqual({
      type: 'AUTO_APPROVE',
    });
  });

  it('routes a volume spike to manual review', () => {
    const d = evaluateApproval({ ...base, orderTotal: 1201 });
    expect(d.type).toBe('MANUAL_REVIEW');
    expect(d).toMatchObject({ reasons: ['VOLUME_SPIKE'] });
  });

  it('routes new retailers to manual review', () => {
    const d = evaluateApproval({ ...base, isNewRetailer: true });
    expect(d).toMatchObject({ reasons: ['NEW_RETAILER'] });
  });

  it('blocks orders that would exceed the credit limit', () => {
    const d = evaluateApproval({
      ...base,
      accountBalance: 19500,
      orderTotal: 1000,
    });
    expect(d).toMatchObject({ reasons: ['OVER_CREDIT_LIMIT'] });
  });

  it('accumulates multiple reasons', () => {
    const d = evaluateApproval({
      ...base,
      isNewRetailer: true,
      hasNewSku: true,
      orderTotal: 5000,
      accountBalance: 19000,
    });
    expect(d.type).toBe('MANUAL_REVIEW');
    if (d.type === 'MANUAL_REVIEW') {
      expect(d.reasons).toEqual(
        expect.arrayContaining([
          'NEW_RETAILER',
          'NEW_SKU',
          'VOLUME_SPIKE',
          'OVER_CREDIT_LIMIT',
        ]),
      );
    }
  });

  it('skips the volume check when there is no standing baseline', () => {
    // No baseline => a large order does NOT trip VOLUME_SPIKE (still within credit).
    expect(
      evaluateApproval({ ...base, standingTotal: null, orderTotal: 15000 }),
    ).toEqual({ type: 'AUTO_APPROVE' });
  });
});
