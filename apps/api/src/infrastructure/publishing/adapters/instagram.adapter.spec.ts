// apps/api/src/infrastructure/publishing/adapters/instagram.adapter.spec.ts

import { describe, expect, it } from 'vitest';
import { InstagramAdapter } from './instagram.adapter';
import type { Content } from '@domain/entities/content.entity';
import type { SocialConnection } from '@domain/entities/publish.entity';

const connection: SocialConnection = {
  id: 'c1',
  companyId: 'co1',
  platform: 'INSTAGRAM',
  externalId: '17841400000000000',
  displayName: 'Demo IG',
  accessToken: 'token',
  refreshToken: null,
  metadata: null,
  connectedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseContent: Content = {
  id: 'content1',
  companyId: 'co1',
  type: 'INSTAGRAM_POST',
  status: 'DRAFT',
  title: 'Hola',
  copy: 'Copy',
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

describe('InstagramAdapter', () => {
  it('canPublish when token and ig user id exist', () => {
    const adapter = new InstagramAdapter();
    expect(adapter.canPublish(connection)).toBe(true);
    expect(adapter.canPublish(null)).toBe(false);
  });

  it('requires a public image URL', async () => {
    const adapter = new InstagramAdapter();
    await expect(adapter.publish(baseContent, connection)).rejects.toMatchObject({
      code: 'INSTAGRAM_IMAGE_REQUIRED',
    });
  });
});
