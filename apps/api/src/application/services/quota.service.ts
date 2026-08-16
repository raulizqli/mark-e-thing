// apps/api/src/application/services/quota.service.ts

import type { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AppError } from '../../shared/errors/app-error';

export type GenerationKind = 'content' | 'image';

export class QuotaService {
  constructor(private readonly prisma: PrismaService) {}

  private yearMonth(date = new Date()): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  async assertAndConsume(userId: string, kind: GenerationKind): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound('User', userId);
    }

    const quota =
      kind === 'content' ? user.monthlyContentQuota : user.monthlyImageQuota;
    const ym = this.yearMonth();

    const usage = await this.prisma.generationUsage.upsert({
      where: {
        userId_kind_yearMonth: { userId, kind, yearMonth: ym },
      },
      create: { userId, kind, yearMonth: ym, count: 0 },
      update: {},
    });

    if (usage.count >= quota) {
      throw new AppError(
        429,
        'QUOTA_EXCEEDED',
        `Monthly ${kind} generation quota exceeded (${quota}/${ym})`,
      );
    }

    await this.prisma.generationUsage.update({
      where: { id: usage.id },
      data: { count: { increment: 1 } },
    });
  }

  async getUsage(userId: string): Promise<{
    yearMonth: string;
    content: { used: number; quota: number };
    image: { used: number; quota: number };
  }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound('User', userId);
    }

    const ym = this.yearMonth();
    const rows = await this.prisma.generationUsage.findMany({
      where: { userId, yearMonth: ym },
    });
    const contentUsed = rows.find((row) => row.kind === 'content')?.count ?? 0;
    const imageUsed = rows.find((row) => row.kind === 'image')?.count ?? 0;

    return {
      yearMonth: ym,
      content: { used: contentUsed, quota: user.monthlyContentQuota },
      image: { used: imageUsed, quota: user.monthlyImageQuota },
    };
  }
}
