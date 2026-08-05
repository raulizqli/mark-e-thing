// src/modules/enrichment/extractors/tech-stack.extractor.ts
import type { Extractor, ExtractorInput } from './extractor.interface.js';

export interface TechStackResult {
  technologies: string[];
  hasGoogleAnalytics: boolean;
  hasMetaPixel: boolean;
}

const TECH_SIGNATURES: Array<{ name: string; pattern: RegExp }> = [
  { name: 'WordPress', pattern: /wp-content|wordpress/i },
  { name: 'Shopify', pattern: /cdn\.shopify\.com|Shopify\.theme/i },
  { name: 'React', pattern: /react(?:\.production)?\.min\.js|data-reactroot/i },
  { name: 'Next.js', pattern: /_next\/static|__NEXT_DATA__/i },
  { name: 'Vue', pattern: /vue(?:\.runtime)?\.min\.js|data-v-/i },
  { name: 'Wix', pattern: /static\.wixstatic\.com|wix\.com/i },
  { name: 'Squarespace', pattern: /squarespace\.com|static\.squarespace/i },
];

export class TechStackExtractor implements Extractor<TechStackResult> {
  readonly name = 'tech-stack';

  extract(input: ExtractorInput): TechStackResult {
    const technologies = TECH_SIGNATURES.filter((signature) =>
      signature.pattern.test(input.html),
    ).map((signature) => signature.name);

    const hasGoogleAnalytics =
      /gtag\(|google-analytics\.com|googletagmanager\.com/i.test(input.html);
    const hasMetaPixel = /fbq\(|connect\.facebook\.net\/.*fbevents/i.test(
      input.html,
    );

    return { technologies, hasGoogleAnalytics, hasMetaPixel };
  }
}
