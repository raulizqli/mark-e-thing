// apps/api/src/infrastructure/publishing/adapters/facebook.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

const GRAPH = 'https://graph.facebook.com/v21.0';

@Injectable()
export class FacebookAdapter implements PublishAdapter {
  readonly platform = 'FACEBOOK' as const;

  canPublish(connection: SocialConnection | null): boolean {
    return Boolean(connection?.accessToken && connection.externalId);
  }

  async publish(content: Content, connection: SocialConnection): Promise<PublishResult> {
    if (!connection.accessToken || !connection.externalId) {
      throw new AppError(
        400,
        'PLATFORM_NOT_CONFIGURED',
        'Facebook Page connection is missing page id or access token',
      );
    }

    const message = [content.title, content.copy, content.cta, content.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 5000);

    const imageUrl = content.image?.url ?? null;
    const endpoint = imageUrl
      ? `${GRAPH}/${connection.externalId}/photos`
      : `${GRAPH}/${connection.externalId}/feed`;

    const body = new URLSearchParams({
      access_token: connection.accessToken,
      ...(imageUrl
        ? { url: imageUrl, caption: message }
        : { message }),
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const json = (await response.json()) as {
      id?: string;
      post_id?: string;
      error?: { message?: string };
    };

    if (!response.ok || !(json.id || json.post_id)) {
      throw new AppError(
        502,
        'FACEBOOK_PUBLISH_FAILED',
        json.error?.message ?? `Facebook publish failed (${response.status})`,
      );
    }

    return {
      externalId: json.post_id ?? json.id!,
      publishedAt: new Date(),
      payload: { platform: 'FACEBOOK', pageId: connection.externalId },
    };
  }
}
