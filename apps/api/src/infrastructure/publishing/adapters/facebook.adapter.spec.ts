// apps/api/src/infrastructure/publishing/adapters/facebook.adapter.spec.ts

import { describe, expect, it } from 'vitest';
import { FacebookAdapter } from './facebook.adapter';

describe('FacebookAdapter', () => {
  it('canPublish only with page id and token', () => {
    const adapter = new FacebookAdapter();
    expect(adapter.canPublish(null)).toBe(false);
    expect(
      adapter.canPublish({
        id: '1',
        companyId: 'c',
        platform: 'FACEBOOK',
        externalId: '123',
        displayName: 'Page',
        accessToken: 'tok',
        refreshToken: null,
        metadata: null,
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toBe(true);
  });
});
