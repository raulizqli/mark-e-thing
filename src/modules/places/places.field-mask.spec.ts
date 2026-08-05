// src/modules/places/places.field-mask.spec.ts
import { describe, expect, it } from 'vitest';
import {
  buildFieldMaskHeader,
  PLACES_FIELD_PATHS,
} from './places.field-mask.js';

describe('places.field-mask', () => {
  it('joins default field paths into a header value', () => {
    const header = buildFieldMaskHeader();
    expect(header).toBe(PLACES_FIELD_PATHS.join(','));
    expect(header).toContain('places.id');
    expect(header).toContain('places.location');
  });

  it('supports a custom subset of fields', () => {
    expect(buildFieldMaskHeader(['places.id', 'places.displayName'])).toBe(
      'places.id,places.displayName',
    );
  });
});
