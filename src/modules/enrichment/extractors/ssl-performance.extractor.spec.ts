// src/modules/enrichment/extractors/ssl-performance.extractor.spec.ts
import { describe, expect, it } from 'vitest';
import { SslPerformanceExtractor } from './ssl-performance.extractor.js';

describe('SslPerformanceExtractor', () => {
  it('passes through ssl and load-time signals', () => {
    const extractor = new SslPerformanceExtractor();

    expect(
      extractor.extract({
        websiteUri: 'https://example.com',
        html: '',
        loadTimeMs: 340,
        sslValid: true,
        sslIssuer: 'Amazon',
      }),
    ).toEqual({
      sslValid: true,
      sslIssuer: 'Amazon',
      loadTimeMs: 340,
    });
  });
});
