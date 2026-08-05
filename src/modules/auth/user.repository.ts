// src/modules/auth/user.repository.ts
import type { PrismaClient, Role, User } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export interface UpsertAuthUserInput {
  id: string;
  email: string;
  name?: string | null;
}

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async upsertFromAuth(input: UpsertAuthUserInput): Promise<User> {
    return this.db.user.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
        role: 'USER',
      },
      update: {
        email: input.email,
        ...(input.name !== undefined ? { name: input.name } : {}),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }
}

export type { Role };
