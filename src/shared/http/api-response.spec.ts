// src/shared/http/api-response.spec.ts
import { describe, expect, it } from 'vitest';
import { errorResponse, successResponse } from './api-response.js';

describe('api-response', () => {
  it('builds a success envelope', () => {
    expect(successResponse({ id: '1' })).toEqual({
      success: true,
      data: { id: '1' },
    });
  });

  it('builds an error envelope with default details', () => {
    expect(errorResponse('Something failed')).toEqual({
      success: false,
      error: { message: 'Something failed', details: null },
    });
  });

  it('builds an error envelope with details', () => {
    expect(errorResponse('Invalid', { field: 'email' })).toEqual({
      success: false,
      error: { message: 'Invalid', details: { field: 'email' } },
    });
  });
});
