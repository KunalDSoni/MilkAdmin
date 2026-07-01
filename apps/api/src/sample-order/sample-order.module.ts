import { Module } from '@nestjs/common';
import { SampleOrderController } from './sample-order.controller';
import { SampleOrderService } from './sample-order.service';

@Module({
  controllers: [SampleOrderController],
  providers: [SampleOrderService],
})
export class SampleOrderModule {}
