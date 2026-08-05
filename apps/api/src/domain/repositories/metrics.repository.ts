// apps/api/src/domain/repositories/metrics.repository.ts

import type {
  CreateMetricsSnapshotData,
  MetricsSnapshot,
} from '../entities/agent.entity';

export interface MetricsRepository {
  create(data: CreateMetricsSnapshotData): Promise<MetricsSnapshot>;
  findLatestByCompanyId(companyId: string): Promise<MetricsSnapshot | null>;
  findRecentByCompanyId(
    companyId: string,
    since: Date,
  ): Promise<MetricsSnapshot | null>;
}
