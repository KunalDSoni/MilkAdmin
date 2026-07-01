import { Injectable } from '@nestjs/common';
import { OrderSummaryDto, OrderSummaryRow } from '@moderns-milk/contracts';
import { Prisma } from '@moderns-milk/database';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthenticatedUser } from '../common/auth/current-user.decorator';

const UNASSIGNED = 'Unassigned';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Area-wise product × quantity pivot for a delivery date (spec §5.1).
   * Quantity uses the approved figure once set, else the ordered figure —
   * production plans against the latest committed demand.
   */
  async orderSummary(user: AuthenticatedUser, date: string): Promise<OrderSummaryDto> {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    // Draft/cancelled orders are not real demand.
    const orderWhere: Prisma.OrderWhereInput = {
      deliveryDate: { gte: start, lte: end },
      status: { notIn: ['DRAFT', 'CANCELLED'] },
    };
    // Scope for staff: only their own distributor's demand.
    if (user.role !== 'ADMIN' && user.role !== 'SALES_HEAD' && user.distributorId) {
      orderWhere.distributorId = user.distributorId;
    }

    const items = await this.prisma.orderItem.findMany({
      where: { order: orderWhere },
      select: {
        qtyOrdered: true,
        qtyApproved: true,
        product: { select: { id: true, name: true, uom: true } },
        order: { select: { distributor: { select: { region: true } } } },
      },
    });

    // product -> area -> qty
    const areaSet = new Set<string>();
    const byProduct = new Map<
      string,
      { name: string; uom: string; areas: Map<string, number>; total: number }
    >();

    for (const it of items) {
      const area = it.order.distributor.region?.trim() || UNASSIGNED;
      areaSet.add(area);
      const qty = Number(it.qtyApproved ?? it.qtyOrdered);
      const entry =
        byProduct.get(it.product.id) ??
        { name: it.product.name, uom: it.product.uom, areas: new Map(), total: 0 };
      entry.areas.set(area, (entry.areas.get(area) ?? 0) + qty);
      entry.total += qty;
      byProduct.set(it.product.id, entry);
    }

    const areas = [...areaSet].sort((a, b) => {
      if (a === UNASSIGNED) return 1;
      if (b === UNASSIGNED) return -1;
      return a.localeCompare(b);
    });

    const fmt = (n: number) => (Math.round(n * 1000) / 1000).toString();
    const rows: OrderSummaryRow[] = [...byProduct.entries()]
      .map(([productId, e]) => ({
        productId,
        productName: e.name,
        uom: e.uom,
        byArea: Object.fromEntries(areas.map((a) => [a, fmt(e.areas.get(a) ?? 0)])),
        total: fmt(e.total),
      }))
      .sort((a, b) => a.productName.localeCompare(b.productName));

    return { date, areas, rows, generatedAt: new Date().toISOString() };
  }
}
