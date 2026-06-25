import type { OrderStatus, ProductDto } from '@moderns-milk/contracts';
import type { OrderDto } from '@/lib/api';
import type { TrendPoint } from '@/components/ui/trend-chart';

/**
 * Derives dashboard figures by *summing and counting values the API already
 * computed*. It never re-derives money or quantities — order.total etc. come
 * straight from the backend and are only aggregated for display.
 */
export interface DashboardSummary {
  totalOrders: number;
  totalOrderValue: number;
  awaitingReview: number;
  approvedCount: number;
  todayOrders: number;
  todayValue: number;
  activeProducts: number;
  statusBreakdown: { status: OrderStatus; count: number }[];
  trend: TrendPoint[];
  recent: OrderDto[];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function deriveDashboard(
  orders: OrderDto[],
  products: ProductDto[],
): DashboardSummary {
  const now = new Date();
  let totalOrderValue = 0;
  let awaitingReview = 0;
  let approvedCount = 0;
  let todayOrders = 0;
  let todayValue = 0;
  const statusCounts = new Map<OrderStatus, number>();

  for (const o of orders) {
    const total = Number(o.total) || 0;
    totalOrderValue += total;
    if (o.status === 'SUBMITTED') awaitingReview += 1;
    if (o.status === 'APPROVED') approvedCount += 1;
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);

    const created = new Date(o.createdAt);
    if (isSameDay(created, now)) {
      todayOrders += 1;
      todayValue += total;
    }
  }

  // 7-day value trend keyed by delivery date.
  const trend: TrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const value = orders
      .filter((o) => isSameDay(new Date(o.deliveryDate), day))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    trend.push({
      label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      value,
    });
  }

  const statusBreakdown = [...statusCounts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    totalOrders: orders.length,
    totalOrderValue,
    awaitingReview,
    approvedCount,
    todayOrders,
    todayValue,
    activeProducts: products.filter((p) => p.active).length,
    statusBreakdown,
    trend,
    recent,
  };
}
