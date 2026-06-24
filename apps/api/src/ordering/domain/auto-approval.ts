/**
 * Exception-based approval. Routine daily orders flow straight to production;
 * only orders that trip a rule are routed to a human. This is what stops the
 * "sales officer approves thousands of orders every morning" bottleneck.
 *
 * Pure function. Money values are passed as numbers purely for comparison here
 * (this is a decision gate, not a place where money is stored or computed).
 */
export interface ApprovalContext {
  orderTotal: number;
  /** Expected baseline from the retailer's standing order, or null if none. */
  standingTotal: number | null;
  /** Allowed upward deviation from baseline, e.g. 0.2 = +20%. */
  tolerancePct: number;
  accountBalance: number;
  creditLimit: number;
  isNewRetailer: boolean;
  /** Order contains a SKU the retailer has never ordered before. */
  hasNewSku: boolean;
}

export type ApprovalDecision =
  | { type: 'AUTO_APPROVE' }
  | { type: 'MANUAL_REVIEW'; reasons: string[] };

export function evaluateApproval(ctx: ApprovalContext): ApprovalDecision {
  const reasons: string[] = [];

  if (ctx.isNewRetailer) {
    reasons.push('NEW_RETAILER');
  }
  if (ctx.hasNewSku) {
    reasons.push('NEW_SKU');
  }
  if (
    ctx.standingTotal !== null &&
    ctx.orderTotal > ctx.standingTotal * (1 + ctx.tolerancePct)
  ) {
    reasons.push('VOLUME_SPIKE');
  }
  if (ctx.accountBalance + ctx.orderTotal > ctx.creditLimit) {
    reasons.push('OVER_CREDIT_LIMIT');
  }

  return reasons.length === 0
    ? { type: 'AUTO_APPROVE' }
    : { type: 'MANUAL_REVIEW', reasons };
}
