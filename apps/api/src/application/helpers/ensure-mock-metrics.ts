// apps/api/src/application/helpers/ensure-mock-metrics.ts

import type { Company } from '@domain/entities/company.entity';
import type { MetricsSnapshot } from '@domain/entities/agent.entity';
import type { MetricsRepository } from '@domain/repositories/metrics.repository';
import { seededInt } from '@infrastructure/agents/agent-utils';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function ensureMockMetrics(
  company: Company,
  metricsRepository: MetricsRepository,
): Promise<MetricsSnapshot> {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  const existing = await metricsRepository.findRecentByCompanyId(company.id, since);
  if (existing) {
    return existing;
  }

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - THIRTY_DAYS_MS);
  const seed = company.name;

  const reach = seededInt(seed + '-reach', 800, 5000);
  const likes = seededInt(seed + '-likes', Math.floor(reach * 0.03), Math.floor(reach * 0.08));
  const comments = seededInt(seed + '-comments', Math.floor(likes * 0.05), Math.floor(likes * 0.15));
  const shares = seededInt(seed + '-shares', Math.floor(likes * 0.02), Math.floor(likes * 0.1));
  const conversions = seededInt(seed + '-conv', 0, Math.floor(reach * 0.01));
  const bestHours = [
    seededInt(seed + '-h1', 8, 11),
    seededInt(seed + '-h2', 12, 14),
    seededInt(seed + '-h3', 17, 20),
  ].sort((a, b) => a - b);

  return metricsRepository.create({
    companyId: company.id,
    platform: 'ALL',
    periodStart,
    periodEnd,
    reach,
    likes,
    comments,
    shares,
    conversions,
    bestHours,
    source: 'mock',
    raw: {
      generatedFrom: 'company_name_hash',
      companyName: company.name,
    },
  });
}
