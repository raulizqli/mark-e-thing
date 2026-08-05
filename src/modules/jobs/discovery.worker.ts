// src/modules/jobs/discovery.worker.ts
import { Worker, type Job } from 'bullmq';
import { DiscoveryService } from '../discovery/discovery.service.js';
import { SearchRepository } from '../search/search.repository.js';
import { logger } from '../../shared/logger/logger.js';
import {
  QUEUE_NAMES,
  type DiscoveryJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';
import { enqueueEnrichmentJobs } from './enrichment.queue.js';

export type EnrichmentBulkEnqueuer = (
  searchId: string,
  businessIds: string[],
) => Promise<void>;

export function createDiscoveryWorker(
  discoveryService = new DiscoveryService(),
  searchRepository = new SearchRepository(),
  enqueueEnrichment: EnrichmentBulkEnqueuer = enqueueEnrichmentJobs,
): Worker<DiscoveryJobPayload> {
  const worker = new Worker<DiscoveryJobPayload>(
    QUEUE_NAMES.DISCOVERY,
    async (job) =>
      processDiscoveryJob(
        job,
        discoveryService,
        searchRepository,
        enqueueEnrichment,
      ),
    {
      connection: getRedisConnection(),
      concurrency: 2,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      { err, jobId: job?.id, searchId: job?.data.searchId },
      'Discovery job failed',
    );
  });

  worker.on('completed', (job) => {
    logger.info(
      { jobId: job.id, searchId: job.data.searchId },
      'Discovery job completed',
    );
  });

  return worker;
}

export async function processDiscoveryJob(
  job: Job<DiscoveryJobPayload>,
  discoveryService: DiscoveryService,
  searchRepository: SearchRepository,
  enqueueEnrichment: EnrichmentBulkEnqueuer = enqueueEnrichmentJobs,
): Promise<{ totalFound: number; businessIds: string[] }> {
  try {
    const result = await discoveryService.run(job.data, async (progress) => {
      const percent =
        progress.cellsTotal === 0
          ? 100
          : Math.round((progress.cellsCompleted / progress.cellsTotal) * 100);
      await job.updateProgress(percent);
    });

    await searchRepository.updateProgress(job.data.searchId, {
      totalFound: result.totalFound,
    });

    if (result.businessIds.length === 0) {
      await searchRepository.updateStatus(job.data.searchId, 'COMPLETED');
    } else {
      await enqueueEnrichment(job.data.searchId, result.businessIds);
    }

    return {
      totalFound: result.totalFound,
      businessIds: result.businessIds,
    };
  } catch (err) {
    await searchRepository.updateStatus(job.data.searchId, 'FAILED');
    throw err;
  }
}
