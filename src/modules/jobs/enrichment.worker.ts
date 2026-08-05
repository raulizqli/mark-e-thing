// src/modules/jobs/enrichment.worker.ts
import { Worker, type Job } from 'bullmq';
import { EnrichmentService } from '../enrichment/enrichment.service.js';
import { logger } from '../../shared/logger/logger.js';
import {
  QUEUE_NAMES,
  type EnrichmentJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';
import { enqueueAnalysisJob } from './analysis.queue.js';

export type AnalysisEnqueuer = (
  searchId: string,
  businessId: string,
) => Promise<unknown>;

export function createEnrichmentWorker(
  enrichmentService = new EnrichmentService(),
  enqueueAnalysis: AnalysisEnqueuer = (searchId, businessId) =>
    enqueueAnalysisJob({ searchId, businessId }),
): Worker<EnrichmentJobPayload> {
  const worker = new Worker<EnrichmentJobPayload>(
    QUEUE_NAMES.ENRICHMENT,
    async (job) => processEnrichmentJob(job, enrichmentService, enqueueAnalysis),
    {
      connection: getRedisConnection(),
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      {
        err,
        jobId: job?.id,
        businessId: job?.data.businessId,
      },
      'Enrichment job failed',
    );
  });

  return worker;
}

export async function processEnrichmentJob(
  job: Job<EnrichmentJobPayload>,
  enrichmentService: EnrichmentService,
  enqueueAnalysis: AnalysisEnqueuer = (searchId, businessId) =>
    enqueueAnalysisJob({ searchId, businessId }),
): Promise<{ businessId: string }> {
  const presence = await enrichmentService.enrichBusiness(job.data.businessId);
  await enqueueAnalysis(job.data.searchId, job.data.businessId);
  return { businessId: presence.businessId };
}
