import { Module } from '@nestjs/common';
import { OrderingModule } from '../ordering/ordering.module';
import { SalesVisitController } from './sales-visit.controller';
import { SalesVisitService } from './sales-visit.service';

@Module({
  imports: [OrderingModule],
  controllers: [SalesVisitController],
  providers: [SalesVisitService],
})
export class SalesVisitModule {}
