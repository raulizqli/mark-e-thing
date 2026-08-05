// apps/api/src/presentation/controllers/health.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { success: true, data: { status: 'ok' } };
  }
}
