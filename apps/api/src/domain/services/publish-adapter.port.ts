// apps/api/src/domain/services/publish-adapter.port.ts

import type { Content } from '../entities/content.entity.js';
import type { SocialConnection } from '../entities/publish.entity.js';
import type { PublishPlatform } from '../types/enums.js';

export interface PublishResult {
  externalId: string;
  publishedAt: Date;
  payload?: Record<string, unknown>;
}

export interface PublishAdapter {
  readonly platform: PublishPlatform;
  canPublish(connection: SocialConnection | null): boolean;
  publish(
    content: Content,
    connection: SocialConnection,
  ): Promise<PublishResult>;
}

export interface PublishAdapterRegistry {
  getAdapter(platform: PublishPlatform): PublishAdapter | null;
}
