// src/modules/scoring/rules/website-presence.rule.ts
import type {
  ScoringContext,
  ScoringRule,
  ScoringRuleResult,
} from './scoring-rule.interface.js';

export class WebsitePresenceRule implements ScoringRule {
  readonly name = 'website-presence';
  readonly weight = 25;

  evaluate(context: ScoringContext): ScoringRuleResult {
    const hasWebsite = Boolean(context.business.websiteUri);
    const score = hasWebsite ? 20 : 100;

    return {
      rule: this.name,
      score,
      weight: this.weight,
      rationale: hasWebsite
        ? 'Business already has a website (lower opportunity)'
        : 'No website detected (high opportunity)',
    };
  }
}
