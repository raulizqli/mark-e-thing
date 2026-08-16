// apps/api/src/application/services/quota.service.spec.ts

import { describe, expect, it, vi } from 'vitest';
import { QuotaService } from './quota.service';

describe('QuotaService', () => {
  it('blocks when monthly quota is exhausted', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'u1',
          monthlyContentQuota: 1,
          monthlyImageQuota: 1,
        }),
      },
      generationUsage: {
        upsert: vi.fn().mockResolvedValue({ id: 'usage1', count: 1 }),
        update: vi.fn(),
      },
    };

    const service = new QuotaService(prisma as never);
    await expect(service.assertAndConsume('u1', 'content')).rejects.toMatchObject({
      code: 'QUOTA_EXCEEDED',
    });
    expect(prisma.generationUsage.update).not.toHaveBeenCalled();
  });

  it('increments usage when under quota', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'u1',
          monthlyContentQuota: 10,
          monthlyImageQuota: 10,
        }),
      },
      generationUsage: {
        upsert: vi.fn().mockResolvedValue({ id: 'usage1', count: 2 }),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    const service = new QuotaService(prisma as never);
    await service.assertAndConsume('u1', 'content');
    expect(prisma.generationUsage.update).toHaveBeenCalledWith({
      where: { id: 'usage1' },
      data: { count: { increment: 1 } },
    });
  });
});
