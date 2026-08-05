// src/modules/enrichment/extractors/ssl-performance.extractor.ts
import type { Extractor, ExtractorInput } from './extractor.interface.js';

export interface SslPerformanceResult {
  sslValid: boolean;
  sslIssuer: string | null;
  loadTimeMs: number | null;
}

export class SslPerformanceExtractor implements Extractor<SslPerformanceResult> {
  readonly name = 'ssl-performance';

  extract(input: ExtractorInput): SslPerformanceResult {
    return {
      sslValid: input.sslValid,
      sslIssuer: input.sslIssuer,
      loadTimeMs: input.loadTimeMs,
    };
  }
}
