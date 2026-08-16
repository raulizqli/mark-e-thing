// apps/api/src/infrastructure/publishing/adapters/x.adapter.spec.ts

import { describe, expect, it } from 'vitest';
import { XAdapter } from './x.adapter';

describe('XAdapter', () => {
  it('canPublish when access token exists', () => {
    const adapter = new XAdapter();
    expect(adapter.canPublish(null)).toBe(false);
    expect(
      adapter.canPublish({
        id: '1',
        companyId: 'c',
        platform: 'X',
        externalId: '42',
        displayName: '@demo',
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
