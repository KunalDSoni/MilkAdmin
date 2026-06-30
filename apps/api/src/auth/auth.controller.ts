import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  RequestOtpInput,
  VerifyOtpInput,
  RefreshInput,
  requestOtpSchema,
  verifyOtpSchema,
  refreshSchema,
} from '@moderns-milk/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from '../common/auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/auth/current-user.decorator';
import { Throttle } from '../common/throttle/throttle.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ limit: 5, ttlSec: 60 })
  @Post('otp/request')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(requestOtpSchema))
  async requestOtp(@Body() body: RequestOtpInput, @Ip() ip: string) {
    await this.auth.requestOtp(body.phone, ip);
    // Always 200 with a neutral message (no user enumeration).
    return { message: 'If the number is registered, a code has been sent.' };
  }

  @Public()
  @Throttle({ limit: 10, ttlSec: 60 })
  @Post('otp/verify')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() body: VerifyOtpInput) {
    return this.auth.verifyOtp(body.phone, body.code);
  }

  @Public()
  @Throttle({ limit: 30, ttlSec: 60 })
  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(refreshSchema))
  async refresh(@Body() body: RefreshInput) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.auth.logout(user.userId);
  }
}
