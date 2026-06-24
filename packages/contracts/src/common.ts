import { z } from 'zod';

export const Role = z.enum([
  'ADMIN',
  'SALES_HEAD',
  'SALES_OFFICER',
  'DISTRIBUTOR',
  'RETAILER',
]);
export type Role = z.infer<typeof Role>;

// E.164-ish phone. Kept strict enough to be safe, loose enough for Indian numbers.
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be E.164 format, e.g. +9198XXXXXXXX');

// Quantities and money travel as strings to preserve Decimal precision over JSON.
export const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,3})?$/, 'Must be a non-negative decimal');

export const cuid = z.string().min(1);

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type Pagination = z.infer<typeof paginationSchema>;
