// apps/api/src/infrastructure/publishing/adapters/linkedin.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity.js';
import type { SocialConnection } from '@domain/entities/publish.entity.js';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port.js';
import { AppError } from '@shared/errors/app-error.js';

@Injectable()
export class LinkedinAdapter implements PublishAdapter {
  readonly platform = 'LINKEDIN' as const;

  canPublish(_connection: SocialConnection | null): boolean {
    return false;
  }

  async publish(_content: Content, _connection: SocialConnection): Promise<PublishResult> {
    console.log('[LinkedinAdapter] not connected');
    throw new AppError(
      400,
      'PLATFORM_NOT_CONFIGURED',
      'Platform adapter not configured — connect credentials in Phase 1+',
    );
  }
}
