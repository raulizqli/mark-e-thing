// apps/api/src/infrastructure/publishing/adapters/whatsapp.adapter.spec.ts

import { describe, expect, it } from 'vitest';
import { WhatsappAdapter } from './whatsapp.adapter';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';

const connection: SocialConnection = {
  id: '1',
  companyId: 'c',
  platform: 'WHATSAPP',
  externalId: '123456',
  displayName: 'WA',
  accessToken: 'tok',
  refreshToken: null,
  metadata: {},
  connectedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const content: Content = {
  id: 'content1',
  companyId: 'c',
  type: 'WHATSAPP_STATUS',
  status: 'DRAFT',
  title: 'Hola',
  copy: 'Mensaje',
  cta: null,
  emojis: [],
  hashtags: [],
  imagePrompt: null,
  seoKeywords: [],
  currentVersion: 1,
  scheduledAt: null,
  publishedAt: null,
  imageId: null,
  image: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('WhatsappAdapter', () => {
  it('requires defaultRecipient for canPublish', () => {
    const adapter = new WhatsappAdapter();
    expect(adapter.canPublish(connection)).toBe(false);
    expect(
      adapter.canPublish({
        ...connection,
        metadata: { defaultRecipient: '5215512345678' },
      }),
    ).toBe(true);
  });

  it('fails publish without recipient', async () => {
    const adapter = new WhatsappAdapter();
    await expect(adapter.publish(content, connection)).rejects.toMatchObject({
      code: 'WHATSAPP_RECIPIENT_REQUIRED',
    });
  });
});
