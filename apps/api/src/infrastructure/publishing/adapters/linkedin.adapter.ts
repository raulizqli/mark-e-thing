// apps/api/src/infrastructure/publishing/adapters/linkedin.adapter.ts

import { Injectable } from '@nestjs/common';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

@Injectable()
export class LinkedinAdapter implements PublishAdapter {
  readonly platform = 'LINKEDIN' as const;

  canPublish(connection: SocialConnection | null): boolean {
    return Boolean(connection?.accessToken && connection.externalId);
  }

  async publish(content: Content, connection: SocialConnection): Promise<PublishResult> {
    if (!connection.accessToken || !connection.externalId) {
      throw new AppError(
        400,
        'PLATFORM_NOT_CONFIGURED',
        'LinkedIn connection is missing access token or member id',
      );
    }

    const authorUrn = connection.externalId.startsWith('urn:')
      ? connection.externalId
      : `urn:li:person:${connection.externalId}`;

    const commentary = [content.title, content.copy, content.cta, content.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n');

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: commentary.slice(0, 3000) },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AppError(
        502,
        'LINKEDIN_PUBLISH_FAILED',
        `LinkedIn publish failed (${response.status}): ${body.slice(0, 300)}`,
      );
    }

    const externalId =
      response.headers.get('x-restli-id') ??
      response.headers.get('x-linkedin-id') ??
      `linkedin-${Date.now()}`;

    return {
      externalId,
      publishedAt: new Date(),
      payload: { platform: 'LINKEDIN', authorUrn },
    };
  }
}
