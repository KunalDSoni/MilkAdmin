import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/auth/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/auth/current-user.decorator';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  /**
   * Order summary for production (spec §5). Defaults to today; only current or
   * past dates are allowed — future-dated summaries are meaningless.
   */
  @Get('order-summary')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER', 'DISTRIBUTOR')
  orderSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const day = date ?? today;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }
    if (day > today) {
      throw new BadRequestException('Future dates are not allowed');
    }
    return this.reports.orderSummary(user, day);
  }
}
