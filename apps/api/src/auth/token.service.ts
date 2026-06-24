import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { AuthTokens, JwtPayload } from '@moderns-milk/contracts';
import { RedisService } from '../common/redis/redis.service';

/**
 * Short-lived access tokens + rotating, server-side (Redis) refresh tokens.
 * Each refresh token is single-use: refreshing rotates it. Presenting a refresh
 * token that is not in the store (e.g. a stolen, already-rotated one) revokes
 * the user's entire session family — reuse detection.
 */
@Injectable()
export class TokenService {
  private readonly accessTtl: number;
  private readonly refreshTtl: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.accessTtl = this.config.get<number>('JWT_ACCESS_TTL', 900);
    this.refreshTtl = this.config.get<number>('JWT_REFRESH_TTL', 2592000);
  }

  private refreshKey(userId: string, tokenId: string): string {
    return `refresh:${userId}:${tokenId}`;
  }

  async issue(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.accessTtl,
    });

    const tokenId = randomBytes(24).toString('hex');
    await this.redis.setEx(
      this.refreshKey(payload.sub, tokenId),
      '1',
      this.refreshTtl,
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: payload.sub, jti: tokenId },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTtl,
      },
    );

    return { accessToken, refreshToken, expiresIn: this.accessTtl };
  }

  async rotate(
    refreshToken: string,
    rebuild: (userId: string) => Promise<JwtPayload>,
  ): Promise<AuthTokens> {
    let decoded: { sub: string; jti: string };
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const key = this.refreshKey(decoded.sub, decoded.jti);
    const exists = await this.redis.get(key);
    if (!exists) {
      // Token valid by signature but absent from store => already used/stolen.
      await this.revokeAll(decoded.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    await this.redis.del(key); // single-use
    const payload = await rebuild(decoded.sub);
    return this.issue(payload);
  }

  async revokeAll(userId: string): Promise<void> {
    const keys = await this.redis.raw.keys(`refresh:${userId}:*`);
    if (keys.length) await this.redis.raw.del(...keys);
  }
}
