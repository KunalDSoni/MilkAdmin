import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokens, JwtPayload } from '@moderns-milk/contracts';
import { PrismaService } from '../common/prisma/prisma.service';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
  ) {}

  async requestOtp(phone: string, ip: string): Promise<void> {
    // We intentionally do NOT reveal whether the phone is registered
    // (prevents user enumeration). An OTP is sent only to known users, but the
    // response is identical either way.
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (user && user.status === 'ACTIVE') {
      await this.otp.request(phone, ip);
    }
  }

  async verifyOtp(phone: string, code: string): Promise<AuthTokens> {
    const ok = await this.otp.verify(phone, code);
    if (!ok) throw new UnauthorizedException('Invalid code');

    const payload = await this.buildPayload(phone);
    return this.tokens.issue(payload);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.tokens.rotate(refreshToken, (userId) =>
      this.buildPayloadById(userId),
    );
  }

  async logout(userId: string): Promise<void> {
    await this.tokens.revokeAll(userId);
  }

  private async buildPayload(phone: string): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { retailer: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account not found or inactive');
    }
    return {
      sub: user.id,
      role: user.role,
      distributorId:
        user.distributorId ?? user.retailer?.distributorId ?? undefined,
      retailerId: user.retailer?.id,
    };
  }

  private async buildPayloadById(userId: string): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { retailer: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account not found or inactive');
    }
    return {
      sub: user.id,
      role: user.role,
      distributorId:
        user.distributorId ?? user.retailer?.distributorId ?? undefined,
      retailerId: user.retailer?.id,
    };
  }
}
