// apps/api/src/infrastructure/publishing/adapters/whatsapp.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

/**
 * WhatsApp Status publishing requires Meta Business API with approved templates.
 * Direct status posting has strict rate limits and is not available for all accounts.
 */
@Injectable()
export class WhatsappAdapter implements PublishAdapter {
  readonly platform = 'WHATSAPP' as const;

  canPublish(_connection: SocialConnection | null): boolean {
    return false;
  }

  async publish(_content: Content, _connection: SocialConnection): Promise<PublishResult> {
    console.log('[WhatsappAdapter] not connected — Status API limitations apply');
    throw new AppError(
      400,
      'PLATFORM_NOT_CONFIGURED',
      'Platform adapter not configured — connect credentials in Phase 1+',
    );
  }
}
