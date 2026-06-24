import { z } from 'zod';
import { cuid, decimalString } from './common';

export const OrderStatus = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'IN_PRODUCTION',
  'DISPATCHED',
  'DELIVERED',
  'SETTLED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const orderItemInputSchema = z.object({
  productId: cuid,
  qty: decimalString.refine((v) => Number(v) > 0, 'Quantity must be positive'),
});
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;

export const createOrderSchema = z.object({
  orderWindowId: cuid,
  items: z.array(orderItemInputSchema).min(1, 'Order needs at least one item'),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const submitOrderSchema = z.object({
  orderId: cuid,
});
export type SubmitOrderInput = z.infer<typeof submitOrderSchema>;

// Manual approval action by a distributor / sales officer for exception orders.
export const reviewOrderSchema = z.object({
  orderId: cuid,
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(500).optional(),
});
export type ReviewOrderInput = z.infer<typeof reviewOrderSchema>;

export const standingOrderItemSchema = z.object({
  productId: cuid,
  qty: decimalString.refine((v) => Number(v) > 0, 'Quantity must be positive'),
});

export const upsertStandingOrderSchema = z.object({
  // 7-bit weekday mask, Monday = bit 0. 127 = every day.
  weekdayMask: z.number().int().min(0).max(127).default(127),
  active: z.boolean().default(true),
  items: z.array(standingOrderItemSchema).min(1),
});
export type UpsertStandingOrderInput = z.infer<typeof upsertStandingOrderSchema>;
