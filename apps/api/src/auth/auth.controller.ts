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
  LoginInput,
  ChangePasswordInput,
  requestOtpSchema,
  verifyOtpSchema,
  refreshSchema,
  loginSchema,
  changePasswordSchema,
} from '@moderns-milk/contracts';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from '../common/auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/auth/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('otp/request')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(requestOtpSchema))
  async requestOtp(@Body() body: RequestOtpInput, @Ip() ip: string) {
    await this.auth.requestOtp(body.phone, ip);
    return { message: 'If the number is registered, a code has been sent.' };
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() body: VerifyOtpInput) {
    return this.auth.verifyOtp(body.phone, body.code);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
  ) {
    return this.auth.login(body.phone, body.password);
  }

  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
  ) {
    await this.auth.changePassword(user.userId, body.oldPassword, body.newPassword);
  }

  @Public()
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
