import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  CreateSampleOrderInput,
  createSampleOrderSchema,
} from '@moderns-milk/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../common/auth/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/auth/current-user.decorator';
import { SampleOrderService } from './sample-order.service';

/**
 * Sample orders (spec §4/§5). Sales officers and heads place samples for
 * prospects; admin/heads review them (a SO only sees their own).
 */
@Controller('sample-orders')
export class SampleOrderController {
  constructor(private readonly sampleOrders: SampleOrderService) {}

  @Get()
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('date') date?: string,
  ) {
    return this.sampleOrders.list(user, { search, date });
  }

  @Post()
  @Roles('SALES_HEAD', 'SALES_OFFICER')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createSampleOrderSchema)) body: CreateSampleOrderInput,
  ) {
    return this.sampleOrders.create(user, body);
  }
}
