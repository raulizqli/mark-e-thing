// src/modules/enrichment/extractors/social-media.extractor.spec.ts
import { describe, expect, it } from 'vitest';
import { SocialMediaExtractor } from './social-media.extractor.js';

describe('SocialMediaExtractor', () => {
  const extractor = new SocialMediaExtractor();

  it('extracts social profile hrefs', () => {
    const html = `
      <a href="https://facebook.com/acme">fb</a>
      <a href="https://instagram.com/acme">ig</a>
      <a href="https://linkedin.com/company/acme">li</a>
      <a href="https://tiktok.com/@acme">tt</a>
    `;

    expect(
      extractor.extract({
        websiteUri: 'https://example.com',
        html,
        loadTimeMs: 120,
        sslValid: true,
        sslIssuer: null,
      }),
    ).toEqual({
      facebookUrl: 'https://facebook.com/acme',
      instagramUrl: 'https://instagram.com/acme',
      linkedinUrl: 'https://linkedin.com/company/acme',
      tiktokUrl: 'https://tiktok.com/@acme',
    });
  });
});
