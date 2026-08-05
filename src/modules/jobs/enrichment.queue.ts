// src/modules/jobs/enrichment.queue.ts
import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  type EnrichmentJobPayload,
} from '../../shared/queue/queue.registry.js';
import { getRedisConnection } from '../../shared/queue/redis.connection.js';

let enrichmentQueue: Queue<EnrichmentJobPayload> | undefined;

export function getEnrichmentQueue(): Queue<EnrichmentJobPayload> {
  if (!enrichmentQueue) {
    enrichmentQueue = new Queue<EnrichmentJobPayload>(QUEUE_NAMES.ENRICHMENT, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }

  return enrichmentQueue;
}

export async function enqueueEnrichmentJob(
  payload: EnrichmentJobPayload,
): Promise<string> {
  const job = await getEnrichmentQueue().add('enrich', payload, {
    jobId: `enrichment-${payload.searchId}-${payload.businessId}`,
  });
  return job.id ?? payload.businessId;
}

export async function enqueueEnrichmentJobs(
  searchId: string,
  businessIds: string[],
): Promise<void> {
  if (businessIds.length === 0) {
    return;
  }

  await getEnrichmentQueue().addBulk(
    businessIds.map((businessId) => ({
      name: 'enrich',
      data: { searchId, businessId },
      opts: {
        jobId: `enrichment-${searchId}-${businessId}`,
      },
    })),
  );
}

export async function closeEnrichmentQueue(): Promise<void> {
  if (enrichmentQueue) {
    await enrichmentQueue.close();
    enrichmentQueue = undefined;
  }
}
