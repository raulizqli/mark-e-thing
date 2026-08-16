// apps/api/src/infrastructure/publishing/adapters/instagram.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

const GRAPH = 'https://graph.facebook.com/v21.0';

@Injectable()
export class InstagramAdapter implements PublishAdapter {
  readonly platform = 'INSTAGRAM' as const;

  canPublish(connection: SocialConnection | null): boolean {
    return Boolean(connection?.accessToken && connection.externalId);
  }

  async publish(content: Content, connection: SocialConnection): Promise<PublishResult> {
    if (!connection.accessToken || !connection.externalId) {
      throw new AppError(
        400,
        'PLATFORM_NOT_CONFIGURED',
        'Instagram connection is missing business account id or access token',
      );
    }

    const imageUrl = content.image?.url;
    if (!imageUrl || imageUrl.startsWith('/')) {
      throw new AppError(
        400,
        'INSTAGRAM_IMAGE_REQUIRED',
        'Instagram feed posts require a publicly reachable image URL. Generate an image and use S3/public storage.',
      );
    }

    const caption = [content.title, content.copy, content.cta, content.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 2200);

    const createRes = await fetch(`${GRAPH}/${connection.externalId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: imageUrl,
        caption,
        access_token: connection.accessToken,
      }),
    });
    const createJson = (await createRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!createRes.ok || !createJson.id) {
      throw new AppError(
        502,
        'INSTAGRAM_CONTAINER_FAILED',
        createJson.error?.message ?? 'Failed to create Instagram media container',
      );
    }

    const publishRes = await fetch(`${GRAPH}/${connection.externalId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: createJson.id,
        access_token: connection.accessToken,
      }),
    });
    const publishJson = (await publishRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!publishRes.ok || !publishJson.id) {
      throw new AppError(
        502,
        'INSTAGRAM_PUBLISH_FAILED',
        publishJson.error?.message ?? 'Failed to publish Instagram media',
      );
    }

    return {
      externalId: publishJson.id,
      publishedAt: new Date(),
      payload: {
        platform: 'INSTAGRAM',
        igUserId: connection.externalId,
        containerId: createJson.id,
      },
    };
  }
}
