// apps/api/src/presentation/controllers/me.controller.ts

import { Controller, Get, Inject, Req } from '@nestjs/common';
import { QuotaService } from '@application/services/quota.service';
import type { RequestWithUser } from '../middleware/auth.middleware';

@Controller('me')
export class MeController {
  constructor(@Inject(QuotaService) private readonly quotas: QuotaService) {}

  @Get()
  async me(@Req() req: RequestWithUser) {
    const usage = await this.quotas.getUsage(req.user!.id);
    return {
      success: true,
      data: {
        ...req.user,
        usage,
      },
    };
  }
}
