// apps/api/src/infrastructure/publishing/adapters/facebook.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

@Injectable()
export class FacebookAdapter implements PublishAdapter {
  readonly platform = 'FACEBOOK' as const;

  canPublish(_connection: SocialConnection | null): boolean {
    return false;
  }

  async publish(_content: Content, _connection: SocialConnection): Promise<PublishResult> {
    console.log('[FacebookAdapter] not connected');
    throw new AppError(
      400,
      'PLATFORM_NOT_CONFIGURED',
      'Platform adapter not configured — connect credentials in Phase 1+',
    );
  }
}
