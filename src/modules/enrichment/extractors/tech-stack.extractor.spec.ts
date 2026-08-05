// src/modules/enrichment/extractors/tech-stack.extractor.spec.ts
import { describe, expect, it } from 'vitest';
import { TechStackExtractor } from './tech-stack.extractor.js';

describe('TechStackExtractor', () => {
  const extractor = new TechStackExtractor();

  it('detects technologies and tracking pixels', () => {
    const html = `
      <script src="/wp-content/themes/x.js"></script>
      <script src="https://www.googletagmanager.com/gtag/js"></script>
      <script>fbq('init','123');</script>
    `;

    expect(
      extractor.extract({
        websiteUri: 'https://example.com',
        html,
        loadTimeMs: 200,
        sslValid: true,
        sslIssuer: null,
      }),
    ).toEqual({
      technologies: ['WordPress'],
      hasGoogleAnalytics: true,
      hasMetaPixel: true,
    });
  });
});
