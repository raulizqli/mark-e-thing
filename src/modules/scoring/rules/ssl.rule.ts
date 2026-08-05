// src/modules/scoring/rules/ssl.rule.ts
import type {
  ScoringContext,
  ScoringRule,
  ScoringRuleResult,
} from './scoring-rule.interface.js';

export class SslRule implements ScoringRule {
  readonly name = 'ssl';
  readonly weight = 20;

  evaluate(context: ScoringContext): ScoringRuleResult {
    const presence = context.digitalPresence;
    if (!context.business.websiteUri) {
      return {
        rule: this.name,
        score: 50,
        weight: this.weight,
        rationale: 'No website to evaluate SSL',
      };
    }

    const score = presence?.sslValid ? 10 : 90;
    return {
      rule: this.name,
      score,
      weight: this.weight,
      rationale: presence?.sslValid
        ? 'Valid SSL certificate present'
        : 'Missing or invalid SSL certificate',
    };
  }
}
