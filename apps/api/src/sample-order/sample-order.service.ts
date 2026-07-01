import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSampleOrderInput,
  SampleOrderDto,
} from '@moderns-milk/contracts';
import { Prisma } from '@moderns-milk/database';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthenticatedUser } from '../common/auth/current-user.decorator';

const SAMPLE_INCLUDE = {
  placedBy: { select: { name: true } },
  distributor: { select: { name: true } },
  retailer: { select: { shopName: true, distributor: { select: { name: true } } } },
  items: { include: { product: { select: { name: true } } } },
} as const;

type SampleRow = Prisma.SampleOrderGetPayload<{ include: typeof SAMPLE_INCLUDE }>;

@Injectable()
export class SampleOrderService {
  constructor(private readonly prisma: PrismaService) {}

  private toDto(row: SampleRow): SampleOrderDto {
    const targetName =
      row.targetType === 'DISTRIBUTOR'
        ? row.distributor?.name ?? '—'
        : row.retailer?.shopName ?? '—';
    const distributorName =
      row.targetType === 'DISTRIBUTOR'
        ? row.distributor?.name ?? null
        : row.retailer?.distributor?.name ?? null;
    return {
      id: row.id,
      targetType: row.targetType,
      placedBy: row.placedBy.name,
      targetName,
      distributorName,
      deliveryDate: row.deliveryDate.toISOString(),
      note: row.note,
      createdAt: row.createdAt.toISOString(),
      items: row.items.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        qty: i.qty.toString(),
      })),
    };
  }

  // Role scope: ADMIN sees all; a SALES_HEAD sees samples placed by their
  // officers (or themselves); a SALES_OFFICER sees only their own.
  private async scope(user: AuthenticatedUser): Promise<Prisma.SampleOrderWhereInput> {
    if (user.role === 'ADMIN') return {};
    if (user.role === 'SALES_HEAD') {
      const officers = await this.prisma.user.findMany({
        where: { reportsToId: user.userId },
        select: { id: true },
      });
      return { placedById: { in: [user.userId, ...officers.map((o) => o.id)] } };
    }
    return { placedById: user.userId };
  }

  async create(user: AuthenticatedUser, input: CreateSampleOrderInput) {
    // Validate the target exists.
    if (input.targetType === 'DISTRIBUTOR') {
      const d = await this.prisma.distributor.findUnique({
        where: { id: input.distributorId },
      });
      if (!d) throw new NotFoundException('Distributor not found');
    } else {
      const r = await this.prisma.retailer.findUnique({
        where: { id: input.retailerId },
      });
      if (!r) throw new NotFoundException('Retailer not found');
    }

    // Reject duplicate products in the payload early (unique constraint).
    const ids = input.items.map((i) => i.productId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Duplicate product in sample order');
    }

    const created = await this.prisma.sampleOrder.create({
      data: {
        placedById: user.userId,
        targetType: input.targetType,
        distributorId: input.targetType === 'DISTRIBUTOR' ? input.distributorId : null,
        retailerId: input.targetType === 'RETAILER' ? input.retailerId : null,
        deliveryDate: new Date(input.deliveryDate),
        note: input.note ?? null,
        items: {
          create: input.items.map((i) => ({ productId: i.productId, qty: i.qty })),
        },
      },
      include: SAMPLE_INCLUDE,
    });
    return this.toDto(created);
  }

  async list(
    user: AuthenticatedUser,
    filters: { search?: string; date?: string },
  ): Promise<SampleOrderDto[]> {
    const where: Prisma.SampleOrderWhereInput = await this.scope(user);

    if (filters.date) {
      const start = new Date(`${filters.date}T00:00:00`);
      const end = new Date(`${filters.date}T23:59:59.999`);
      where.deliveryDate = { gte: start, lte: end };
    }
    if (filters.search) {
      where.placedBy = { name: { contains: filters.search, mode: 'insensitive' } };
    }

    const rows = await this.prisma.sampleOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: SAMPLE_INCLUDE,
    });
    return rows.map((r) => this.toDto(r));
  }
}
