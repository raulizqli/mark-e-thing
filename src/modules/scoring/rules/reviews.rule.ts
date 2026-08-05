// src/modules/scoring/rules/reviews.rule.ts
import type {
  ScoringContext,
  ScoringRule,
  ScoringRuleResult,
} from './scoring-rule.interface.js';

export class ReviewsRule implements ScoringRule {
  readonly name = 'reviews';
  readonly weight = 25;

  evaluate(context: ScoringContext): ScoringRuleResult {
    const count = context.business.userRatingCount ?? 0;
    const rating = context.business.rating ?? 0;

    let score = 80;
    if (count === 0) {
      score = 100;
    } else if (count < 20) {
      score = 70;
    } else if (rating >= 4.5) {
      score = 30;
    } else if (rating < 3.5) {
      score = 85;
    } else {
      score = 50;
    }

    return {
      rule: this.name,
      score,
      weight: this.weight,
      rationale: `Rating ${rating || 'n/a'} across ${count} reviews`,
    };
  }
}
