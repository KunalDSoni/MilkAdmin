import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth/jwt-auth.guard';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'moderns-milk-api' };
  }
}
