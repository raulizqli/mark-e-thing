// src/modules/enrichment/extractors/extractor.interface.ts
export interface ExtractorInput {
  websiteUri: string | null;
  html: string;
  loadTimeMs: number | null;
  sslValid: boolean;
  sslIssuer: string | null;
}

export interface Extractor<TResult> {
  readonly name: string;
  extract(input: ExtractorInput): Promise<TResult> | TResult;
}
