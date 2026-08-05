// src/modules/enrichment/extractors/email.extractor.spec.ts
import { describe, expect, it } from 'vitest';
import { EmailExtractor } from './email.extractor.js';

describe('EmailExtractor', () => {
  const extractor = new EmailExtractor();

  it('extracts unique emails and ignores image-like matches', () => {
    const html = `
      <a href="mailto:Sales@Example.com">Contact</a>
      Contact us at hello@example.com or sales@example.com
      <img src="foo@cdn.com.png" />
    `;

    expect(
      extractor.extract({
        websiteUri: 'https://example.com',
        html,
        loadTimeMs: 100,
        sslValid: true,
        sslIssuer: 'Let\'s Encrypt',
      }),
    ).toEqual(['sales@example.com', 'hello@example.com']);
  });
});
