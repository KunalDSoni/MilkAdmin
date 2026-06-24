import { Controller, Get, Query } from '@nestjs/common';
import {
  ListProductsQuery,
  listProductsQuerySchema,
} from '@moderns-milk/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('products')
  listProducts(
    @Query(new ZodValidationPipe(listProductsQuerySchema))
    query: ListProductsQuery,
  ) {
    return this.catalog.listProducts(query);
  }
}
