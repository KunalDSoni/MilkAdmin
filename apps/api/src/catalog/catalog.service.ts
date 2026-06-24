import { Injectable } from '@nestjs/common';
import { ListProductsQuery, ProductDto } from '@moderns-milk/contracts';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsQuery): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        category: query.category,
        active: query.active ?? true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      uom: p.uom,
      packSize: p.packSize.toString(),
      taxRate: p.taxRate.toString(),
      isReturnablePack: p.isReturnablePack,
      active: p.active,
    }));
  }
}
