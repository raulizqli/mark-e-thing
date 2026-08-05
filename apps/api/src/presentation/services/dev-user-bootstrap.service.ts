// apps/api/src/presentation/services/dev-user-bootstrap.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { env } from '../../config/env.js';
import { PrismaService } from '@infrastructure/prisma/prisma.service.js';

export interface DevUser {
  id: string;
  email: string;
  name: string | null;
}

@Injectable()
export class DevUserBootstrapService implements OnModuleInit {
  private cachedUser: DevUser | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const row = await this.prisma.user.upsert({
      where: { id: env.DEV_USER_ID },
      create: {
        id: env.DEV_USER_ID,
        email: env.DEV_USER_EMAIL,
        name: env.DEV_USER_NAME,
      },
      update: {
        email: env.DEV_USER_EMAIL,
        name: env.DEV_USER_NAME,
      },
    });

    this.cachedUser = {
      id: row.id,
      email: row.email,
      name: row.name,
    };
  }

  getUser(): DevUser {
    if (!this.cachedUser) {
      throw new Error('Dev user not bootstrapped');
    }
    return this.cachedUser;
  }
}
