// src/modules/scoring/scoring.engine.ts
import type { Priority } from '@prisma/client';
import type {
  ScoringContext,
  ScoringRule,
  ScoringRuleResult,
} from './rules/scoring-rule.interface.js';
import { ReviewsRule } from './rules/reviews.rule.js';
import { SslRule } from './rules/ssl.rule.js';
import { TechGapRule } from './rules/tech-gap.rule.js';
import { WebsitePresenceRule } from './rules/website-presence.rule.js';

export interface ScoringResult {
  leadScore: number;
  priority: Priority;
  scoringRules: ScoringRuleResult[];
}

export class ScoringEngine {
  constructor(
    private readonly rules: ScoringRule[] = [
      new WebsitePresenceRule(),
      new SslRule(),
      new ReviewsRule(),
      new TechGapRule(),
    ],
  ) {}

  score(context: ScoringContext): ScoringResult {
    const scoringRules = this.rules.map((rule) => rule.evaluate(context));
    const totalWeight = scoringRules.reduce((sum, rule) => sum + rule.weight, 0);
    const weighted = scoringRules.reduce(
      (sum, rule) => sum + rule.score * rule.weight,
      0,
    );
    const leadScore =
      totalWeight === 0 ? 0 : Math.round(weighted / totalWeight);

    return {
      leadScore,
      priority: toPriority(leadScore),
      scoringRules,
    };
  }
}

function toPriority(leadScore: number): Priority {
  if (leadScore >= 75) return 'HIGH';
  if (leadScore >= 45) return 'MEDIUM';
  return 'LOW';
}
