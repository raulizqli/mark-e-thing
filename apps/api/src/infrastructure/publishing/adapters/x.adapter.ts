// apps/api/src/infrastructure/publishing/adapters/x.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

@Injectable()
export class XAdapter implements PublishAdapter {
  readonly platform = 'X' as const;

  canPublish(connection: SocialConnection | null): boolean {
    return Boolean(connection?.accessToken);
  }

  async publish(content: Content, connection: SocialConnection): Promise<PublishResult> {
    if (!connection.accessToken) {
      throw new AppError(400, 'PLATFORM_NOT_CONFIGURED', 'X connection is missing access token');
    }

    const text = [content.title, content.copy, content.cta, content.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 280);

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const json = (await response.json()) as {
      data?: { id?: string };
      detail?: string;
      title?: string;
      errors?: Array<{ message?: string }>;
    };

    if (!response.ok || !json.data?.id) {
      const message =
        json.detail ??
        json.title ??
        json.errors?.[0]?.message ??
        `X publish failed (${response.status})`;
      throw new AppError(502, 'X_PUBLISH_FAILED', message);
    }

    return {
      externalId: json.data.id,
      publishedAt: new Date(),
      payload: { platform: 'X', textLength: text.length },
    };
  }
}
