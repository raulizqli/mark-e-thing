// src/modules/jobs/analysis.worker.ts
import { Worker, type Job } from 'bullmq';
import { AnalysisService } from '../analysis/analysis.service.js';
import { AnalysisRepository } from '../analysis/analysis.repository.js';
import { SearchRepository } from '../search/search.repository.js';
import { logger } from '../../shared/logger/logger.js';
import {
  QUEUE_NAMES,
  type AnalysisJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';

export function createAnalysisWorker(
  analysisService = new AnalysisService(),
  analysisRepository = new AnalysisRepository(),
  searchRepository = new SearchRepository(),
): Worker<AnalysisJobPayload> {
  const worker = new Worker<AnalysisJobPayload>(
    QUEUE_NAMES.ANALYSIS,
    async (job) =>
      processAnalysisJob(
        job,
        analysisService,
        analysisRepository,
        searchRepository,
      ),
    {
      connection: getRedisConnection(),
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      {
        err,
        jobId: job?.id,
        businessId: job?.data.businessId,
      },
      'Analysis job failed',
    );
  });

  return worker;
}

export async function processAnalysisJob(
  job: Job<AnalysisJobPayload>,
  analysisService: AnalysisService,
  analysisRepository: AnalysisRepository,
  searchRepository: SearchRepository,
): Promise<{ businessId: string }> {
  const analysis = await analysisService.analyzeBusiness(job.data.businessId);

  const [analyzedCount, totalBusinesses] = await Promise.all([
    analysisRepository.countBySearchId(job.data.searchId),
    analysisRepository.countBusinessesBySearchId(job.data.searchId),
  ]);

  if (totalBusinesses > 0 && analyzedCount >= totalBusinesses) {
    await searchRepository.updateStatus(job.data.searchId, 'COMPLETED');
  }

  return { businessId: analysis.businessId };
}
