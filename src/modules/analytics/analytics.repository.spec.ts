// src/modules/analytics/analytics.repository.spec.ts
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { AnalyticsRepository } from './analytics.repository.js';

describe('AnalyticsRepository', () => {
  it('aggregates priority distribution and readiness signals', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        business: {
          websiteUri: 'https://a.com',
          digitalPresence: {
            emails: ['a@a.com'],
            sslValid: true,
          },
          analyses: [{ leadScore: 80, priority: 'HIGH' }],
        },
      },
      {
        business: {
          websiteUri: null,
          digitalPresence: {
            emails: [],
            sslValid: false,
          },
          analyses: [{ leadScore: 40, priority: 'LOW' }],
        },
      },
      {
        business: {
          websiteUri: 'https://b.com',
          digitalPresence: null,
          analyses: [],
        },
      },
    ]);

    const db = {
      businessSearch: { findMany },
    } as unknown as PrismaClient;

    const repository = new AnalyticsRepository(db);
    const snapshot = await repository.getSearchAnalytics('search-1');

    expect(snapshot).toEqual({
      searchId: 'search-1',
      totalBusinesses: 3,
      analyzedBusinesses: 2,
      averageLeadScore: 60,
      priorityDistribution: [
        { priority: 'LOW', count: 1 },
        { priority: 'MEDIUM', count: 0 },
        { priority: 'HIGH', count: 1 },
      ],
      withWebsite: 2,
      withEmail: 1,
      withValidSsl: 1,
    });
  });
});
