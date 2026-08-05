// src/modules/llm/llm.service.spec.ts
import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../shared/errors/app-error.js';
import { parseGeneration } from './llm.service.js';

describe('parseGeneration', () => {
  it('accepts valid structured JSON', () => {
    const result = parseGeneration(
      JSON.stringify({
        summary: 'Strong local cafe with weak digital presence',
        opportunities: ['Website redesign', 'Review generation'],
        salesProposal: 'We can modernize your online presence',
        coldEmail: 'Hi there...',
        whatsappMessage: 'Hello...',
        aiNeeds: { website: true },
      }),
    );

    expect(result.summary).toContain('cafe');
    expect(result.opportunities).toHaveLength(2);
  });

  it('rejects non-json content', () => {
    expect(() => parseGeneration('not-json')).toThrow(ValidationError);
  });

  it('rejects schema-invalid payloads', () => {
    expect(() =>
      parseGeneration(JSON.stringify({ summary: 'only summary' })),
    ).toThrow(ValidationError);
  });
});
