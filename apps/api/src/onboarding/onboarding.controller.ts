import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  OnboardDistributorInput,
  OnboardRetailerInput,
  OnboardStaffInput,
  UpdateOnboardingInput,
  onboardDistributorSchema,
  onboardRetailerSchema,
  onboardStaffSchema,
  updateOnboardingSchema,
} from '@moderns-milk/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../common/auth/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/auth/current-user.decorator';
import { OnboardingService } from './onboarding.service';

/**
 * Onboarding endpoints (spec §2). ADMIN and SALES_HEAD manage all four user
 * types; SALES_OFFICER may onboard distributors and retailers.
 */
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  // -- lists (tabbed) --------------------------------------------------------

  @Get('distributors')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  listDistributors(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.onboarding.listDistributors(user, search);
  }

  @Get('retailers')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  listRetailers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.onboarding.listRetailers(user, search);
  }

  @Get('sales-heads')
  @Roles('ADMIN')
  listSalesHeads(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.onboarding.listStaff('SALES_HEAD', user, search);
  }

  @Get('sales-officers')
  @Roles('ADMIN', 'SALES_HEAD')
  listSalesOfficers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.onboarding.listStaff('SALES_OFFICER', user, search);
  }

  // -- create / onboard ------------------------------------------------------

  @Post('distributors')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  onboardDistributor(
    @Body(new ZodValidationPipe(onboardDistributorSchema))
    body: OnboardDistributorInput,
  ) {
    return this.onboarding.onboardDistributor(body);
  }

  @Post('retailers')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  onboardRetailer(
    @Body(new ZodValidationPipe(onboardRetailerSchema)) body: OnboardRetailerInput,
  ) {
    return this.onboarding.onboardRetailer(body);
  }

  @Post('staff')
  @Roles('ADMIN')
  onboardStaff(
    @Body(new ZodValidationPipe(onboardStaffSchema)) body: OnboardStaffInput,
  ) {
    return this.onboarding.onboardStaff(body);
  }

  // -- status transitions ----------------------------------------------------

  @Patch('distributors/:id/status')
  @Roles('ADMIN', 'SALES_HEAD')
  updateDistributorStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOnboardingSchema)) body: UpdateOnboardingInput,
  ) {
    return this.onboarding.updateDistributorOnboarding(id, body);
  }

  @Patch('retailers/:id/status')
  @Roles('ADMIN', 'SALES_HEAD', 'SALES_OFFICER')
  updateRetailerStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOnboardingSchema)) body: UpdateOnboardingInput,
  ) {
    return this.onboarding.updateRetailerOnboarding(id, body);
  }
}
