// apps/api/src/infrastructure/publishing/adapters/whatsapp.adapter.ts

import { Injectable } from '@nestjs/common';
import { env } from '../../../config/env';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';
import type { PublishAdapter, PublishResult } from '@domain/services/publish-adapter.port';
import { AppError } from '@shared/errors/app-error';

/**
 * WhatsApp Cloud API publishes as a text (or image) message to a configured recipient.
 * Official Status/Stories posting is not generally available — MarkeThing maps
 * WHATSAPP_STATUS content to a Cloud API message instead.
 */
@Injectable()
export class WhatsappAdapter implements PublishAdapter {
  readonly platform = 'WHATSAPP' as const;

  canPublish(connection: SocialConnection | null): boolean {
    const recipient = connection?.metadata?.defaultRecipient;
    return Boolean(
      connection?.accessToken &&
        connection.externalId &&
        typeof recipient === 'string' &&
        recipient.length > 0,
    );
  }

  async publish(content: Content, connection: SocialConnection): Promise<PublishResult> {
    if (!connection.accessToken || !connection.externalId) {
      throw new AppError(
        400,
        'PLATFORM_NOT_CONFIGURED',
        'WhatsApp connection requires phone number id and access token',
      );
    }

    const recipient = connection.metadata?.defaultRecipient;
    if (typeof recipient !== 'string' || !recipient.trim()) {
      throw new AppError(
        400,
        'WHATSAPP_RECIPIENT_REQUIRED',
        'Set defaultRecipient (E.164, e.g. 5215512345678) on the WhatsApp connection',
      );
    }

    const bodyText = [content.title, content.copy, content.cta]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 4000);

    const imageUrl = content.image?.url;
    const useImage = Boolean(imageUrl && !imageUrl.startsWith('/'));

    const payload = useImage
      ? {
          messaging_product: 'whatsapp',
          to: recipient.trim(),
          type: 'image',
          image: {
            link: imageUrl,
            caption: bodyText.slice(0, 1024),
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: recipient.trim(),
          type: 'text',
          text: { preview_url: true, body: bodyText },
        };

    const response = await fetch(
      `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${connection.externalId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const json = (await response.json()) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    if (!response.ok || !json.messages?.[0]?.id) {
      throw new AppError(
        502,
        'WHATSAPP_PUBLISH_FAILED',
        json.error?.message ?? `WhatsApp publish failed (${response.status})`,
      );
    }

    return {
      externalId: json.messages[0].id!,
      publishedAt: new Date(),
      payload: {
        platform: 'WHATSAPP',
        mode: useImage ? 'image' : 'text',
        note: 'Mapped to Cloud API message (not WhatsApp Status)',
      },
    };
  }
}
