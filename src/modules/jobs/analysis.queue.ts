// src/modules/jobs/analysis.queue.ts
import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  type AnalysisJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';

let analysisQueue: Queue<AnalysisJobPayload> | undefined;

export function getAnalysisQueue(): Queue<AnalysisJobPayload> {
  if (!analysisQueue) {
    analysisQueue = new Queue<AnalysisJobPayload>(QUEUE_NAMES.ANALYSIS, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }

  return analysisQueue;
}

export async function enqueueAnalysisJob(
  payload: AnalysisJobPayload,
): Promise<string> {
  const job = await getAnalysisQueue().add('analyze', payload, {
    jobId: `analysis-${payload.searchId}-${payload.businessId}`,
  });
  return job.id ?? payload.businessId;
}

export async function closeAnalysisQueue(): Promise<void> {
  if (analysisQueue) {
    await analysisQueue.close();
    analysisQueue = undefined;
  }
}
