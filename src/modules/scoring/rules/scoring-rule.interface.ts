// src/modules/scoring/rules/scoring-rule.interface.ts
import type { Business, DigitalPresence } from '@prisma/client';

export interface ScoringContext {
  business: Business;
  digitalPresence: DigitalPresence | null;
}

export interface ScoringRuleResult {
  rule: string;
  score: number;
  weight: number;
  rationale: string;
}

export interface ScoringRule {
  readonly name: string;
  readonly weight: number;
  evaluate(context: ScoringContext): ScoringRuleResult;
}
