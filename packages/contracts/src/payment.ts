import { z } from 'zod';
import { cuid, decimalString } from './common';

// ----- Payment logs (spec §6) -----

export const paymentLogModeSchema = z.enum(['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER']);
export type PaymentLogMode = z.infer<typeof paymentLogModeSchema>;

export const paymentLogStatusSchema = z.enum(['PENDING', 'PAID']);
export type PaymentLogStatus = z.infer<typeof paymentLogStatusSchema>;

export const createPaymentSchema = z.object({
  // Required only when a staff user logs on behalf of a distributor. For a
  // distributor user it is inferred from their own scope (ignored if sent).
  distributorId: cuid.optional(),
  orderId: cuid.optional(),
  amount: decimalString.refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  paymentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  mode: paymentLogModeSchema,
  proofImageKey: z.string().trim().max(200).optional(),
  note: z.string().trim().max(300).optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// Only an ADMIN may move a payment PENDING -> PAID (spec §6.7.1).
export const updatePaymentStatusSchema = z.object({
  status: paymentLogStatusSchema,
});
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;

export interface PaymentLogDto {
  id: string;
  distributorId: string;
  distributorName: string;
  orderId: string | null;
  amount: string;
  paymentDate: string;
  mode: PaymentLogMode;
  status: PaymentLogStatus;
  proofImageKey: string | null;
  note: string | null;
  recordedBy: string;
  createdAt: string;
}
