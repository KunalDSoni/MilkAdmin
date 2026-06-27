import { z } from 'zod';
import { cuid, decimalString } from './common';
import { outletTypeSchema, type OutletType } from './distributor';

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM');
const optionalTime = z.union([z.literal(''), hhmm]).optional();

export const salesVisitItemSchema = z.object({
  productId: cuid,
  qty: decimalString.refine((v) => Number(v) > 0, 'Quantity must be positive'),
});

export const createSalesVisitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  dayStartAt: optionalTime,
  salesOfficerId: cuid,
  retailerId: cuid,
  routeName: z.string().trim().max(60).optional(),
  outletType: outletTypeSchema.default('EXISTING'),
  inTime: optionalTime,
  bookingTime: optionalTime,
  competition: z.string().trim().max(500).optional(),
  remarks: z.string().trim().max(500).optional(),
  // SKU quantities — only positive entries are kept; may be empty (visit only).
  items: z.array(salesVisitItemSchema).default([]),
});
export type CreateSalesVisitInput = z.infer<typeof createSalesVisitSchema>;

export interface SalesVisitDto {
  id: string;
  date: string;
  salesOfficer: string;
  retailer: string;
  route: string | null;
  outletType: OutletType;
  inTime: string | null;
  bookingTime: string | null;
  competition: string | null;
  remarks: string | null;
  itemCount: number;
  orderId: string | null;
  orderTotal: string | null;
  createdAt: string;
}
