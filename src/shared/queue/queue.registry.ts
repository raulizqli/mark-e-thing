// src/shared/queue/queue.registry.ts
export const QUEUE_NAMES = {
  DISCOVERY: 'discovery',
  ENRICHMENT: 'enrichment',
  ANALYSIS: 'analysis',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface DiscoveryJobPayload {
  searchId: string;
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface EnrichmentJobPayload {
  searchId: string;
  businessId: string;
}

export interface AnalysisJobPayload {
  searchId: string;
  businessId: string;
}
