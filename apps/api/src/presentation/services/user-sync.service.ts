// apps/api/src/presentation/services/user-sync.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { env } from '../../config/env';
import type { AuthUser } from '../types/auth-user';

@Injectable()
export class UserSyncService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async upsertFromAuth(input: {
    id: string;
    email: string;
    name?: string | null;
  }): Promise<AuthUser> {
    const row = await this.prisma.user.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
        plan: 'free',
        monthlyContentQuota: env.FREE_MONTHLY_CONTENT_QUOTA,
        monthlyImageQuota: env.FREE_MONTHLY_IMAGE_QUOTA,
      },
      update: {
        email: input.email,
        ...(input.name !== undefined ? { name: input.name } : {}),
      },
    });

    return {
      id: row.id,
      email: row.email,
      name: row.name,
    };
  }
}
