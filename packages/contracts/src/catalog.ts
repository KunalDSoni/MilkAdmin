import { z } from 'zod';

export const ProductCategory = z.enum(['MILK', 'DAIRY']);
export type ProductCategory = z.infer<typeof ProductCategory>;

export const Uom = z.enum(['LITRE', 'ML', 'KG', 'GRAM', 'PIECE', 'POUCH']);
export type Uom = z.infer<typeof Uom>;

export const productDtoSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: ProductCategory,
  uom: Uom,
  packSize: z.string(),
  taxRate: z.string(),
  isReturnablePack: z.boolean(),
  active: z.boolean(),
});
export type ProductDto = z.infer<typeof productDtoSchema>;

export const listProductsQuerySchema = z.object({
  category: ProductCategory.optional(),
  active: z.coerce.boolean().optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
