// src/modules/enrichment/extractors/social-media.extractor.ts
import type { Extractor, ExtractorInput } from './extractor.interface.js';

export interface SocialMediaResult {
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
}

const HREF_REGEX = /href=["']([^"']+)["']/gi;

export class SocialMediaExtractor implements Extractor<SocialMediaResult> {
  readonly name = 'social-media';

  extract(input: ExtractorInput): SocialMediaResult {
    const hrefs: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = HREF_REGEX.exec(input.html)) !== null) {
      hrefs.push(match[1]);
    }

    return {
      facebookUrl: findFirst(hrefs, /facebook\.com\//i),
      instagramUrl: findFirst(hrefs, /instagram\.com\//i),
      linkedinUrl: findFirst(hrefs, /linkedin\.com\//i),
      tiktokUrl: findFirst(hrefs, /tiktok\.com\//i),
    };
  }
}

function findFirst(hrefs: string[], pattern: RegExp): string | null {
  const found = hrefs.find((href) => pattern.test(href));
  return found ?? null;
}
