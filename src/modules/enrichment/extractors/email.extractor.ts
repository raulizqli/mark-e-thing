// src/modules/enrichment/extractors/email.extractor.ts
import type { Extractor, ExtractorInput } from './extractor.interface.js';

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

export class EmailExtractor implements Extractor<string[]> {
  readonly name = 'email';

  extract(input: ExtractorInput): string[] {
    const matches = input.html.match(EMAIL_REGEX) ?? [];
    const unique = new Set<string>();

    for (const email of matches) {
      const normalized = email.toLowerCase();
      if (IGNORED_EXTENSIONS.some((ext) => normalized.endsWith(ext))) {
        continue;
      }
      unique.add(normalized);
    }

    return [...unique];
  }
}
