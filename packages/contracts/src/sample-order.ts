import { z } from 'zod';
import { cuid, decimalString } from './common';

// ----- Sample orders (spec §4/§5) -----

export const sampleTargetTypeSchema = z.enum(['DISTRIBUTOR', 'RETAILER']);
export type SampleTargetType = z.infer<typeof sampleTargetTypeSchema>;

export const sampleOrderItemSchema = z.object({
  productId: cuid,
  qty: decimalString.refine((v) => Number(v) > 0, 'Quantity must be greater than zero'),
});
export type SampleOrderItemInput = z.infer<typeof sampleOrderItemSchema>;

export const createSampleOrderSchema = z
  .object({
    targetType: sampleTargetTypeSchema,
    distributorId: cuid.optional(),
    retailerId: cuid.optional(),
    deliveryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    note: z.string().trim().max(300).optional(),
    items: z.array(sampleOrderItemSchema).min(1, 'Add at least one product'),
  })
  .superRefine((val, ctx) => {
    if (val.targetType === 'DISTRIBUTOR' && !val.distributorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['distributorId'],
        message: 'Select a distributor',
      });
    }
    if (val.targetType === 'RETAILER' && !val.retailerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['retailerId'],
        message: 'Select a retailer',
      });
    }
  });
export type CreateSampleOrderInput = z.infer<typeof createSampleOrderSchema>;

export interface SampleOrderItemDto {
  productId: string;
  productName: string;
  qty: string;
}

export interface SampleOrderDto {
  id: string;
  targetType: SampleTargetType;
  placedBy: string;
  targetName: string; // distributor or retailer/outlet name
  distributorName: string | null;
  deliveryDate: string;
  note: string | null;
  items: SampleOrderItemDto[];
  createdAt: string;
}
