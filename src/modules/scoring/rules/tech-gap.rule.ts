// src/modules/scoring/rules/tech-gap.rule.ts
import type {
  ScoringContext,
  ScoringRule,
  ScoringRuleResult,
} from './scoring-rule.interface.js';

export class TechGapRule implements ScoringRule {
  readonly name = 'tech-gap';
  readonly weight = 30;

  evaluate(context: ScoringContext): ScoringRuleResult {
    const presence = context.digitalPresence;
    if (!presence) {
      return {
        rule: this.name,
        score: 90,
        weight: this.weight,
        rationale: 'No digital presence data; assume high tech gap',
      };
    }

    let score = 40;
    if (!presence.hasGoogleAnalytics) score += 20;
    if (!presence.hasMetaPixel) score += 15;
    if (presence.technologies.length === 0) score += 15;
    if ((presence.loadTimeMs ?? 0) > 3000) score += 10;

    score = Math.min(score, 100);

    return {
      rule: this.name,
      score,
      weight: this.weight,
      rationale: `Tech signals: analytics=${presence.hasGoogleAnalytics}, pixel=${presence.hasMetaPixel}, stack=${presence.technologies.join(',') || 'none'}`,
    };
  }
}
