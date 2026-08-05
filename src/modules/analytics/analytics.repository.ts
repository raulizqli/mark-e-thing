// src/modules/analytics/analytics.repository.ts
import type { PrismaClient, Priority } from '@prisma/client';
import { prisma } from '../../shared/prisma/client.js';

export interface PriorityDistribution {
  priority: Priority;
  count: number;
}

export interface SearchAnalyticsSnapshot {
  searchId: string;
  totalBusinesses: number;
  analyzedBusinesses: number;
  averageLeadScore: number | null;
  priorityDistribution: PriorityDistribution[];
  withWebsite: number;
  withEmail: number;
  withValidSsl: number;
}

export class AnalyticsRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getSearchAnalytics(searchId: string): Promise<SearchAnalyticsSnapshot> {
    const links = await this.db.businessSearch.findMany({
      where: { searchId },
      include: {
        business: {
          include: {
            digitalPresence: true,
            analyses: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const priorityCounts: Record<Priority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    let scoreSum = 0;
    let analyzedBusinesses = 0;
    let withWebsite = 0;
    let withEmail = 0;
    let withValidSsl = 0;

    for (const link of links) {
      if (link.business.websiteUri) {
        withWebsite += 1;
      }

      const presence = link.business.digitalPresence;
      if (presence?.emails.length) {
        withEmail += 1;
      }
      if (presence?.sslValid) {
        withValidSsl += 1;
      }

      const analysis = link.business.analyses[0];
      if (analysis) {
        analyzedBusinesses += 1;
        scoreSum += analysis.leadScore;
        priorityCounts[analysis.priority] += 1;
      }
    }

    return {
      searchId,
      totalBusinesses: links.length,
      analyzedBusinesses,
      averageLeadScore:
        analyzedBusinesses === 0
          ? null
          : Math.round((scoreSum / analyzedBusinesses) * 10) / 10,
      priorityDistribution: (Object.keys(priorityCounts) as Priority[]).map(
        (priority) => ({
          priority,
          count: priorityCounts[priority],
        }),
      ),
      withWebsite,
      withEmail,
      withValidSsl,
    };
  }
}
