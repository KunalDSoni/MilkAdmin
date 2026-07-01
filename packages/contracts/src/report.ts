// ----- Order summary report (spec §5) -----
//
// A production-facing pivot: one row per product, one column per area, each
// cell the total quantity to deliver on the chosen date.

export interface OrderSummaryRow {
  productId: string;
  productName: string;
  uom: string;
  /** Quantity per area name. Missing area => 0. */
  byArea: Record<string, string>;
  total: string;
}

export interface OrderSummaryDto {
  date: string; // YYYY-MM-DD delivery date
  areas: string[]; // column order
  rows: OrderSummaryRow[];
  generatedAt: string;
}
