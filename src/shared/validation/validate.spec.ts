// src/shared/validation/validate.spec.ts
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ValidationError } from '../errors/app-error.js';
import { validate } from './validate.js';

function createMocks(body: unknown = {}) {
  const req = { body, query: {}, params: {} } as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('validate', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it('passes valid body and replaces req.body with parsed data', () => {
    const { req, res, next } = createMocks({ name: 'Ada', age: 36 });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'Ada', age: 36 });
  });

  it('forwards ValidationError for invalid body', () => {
    const { req, res, next } = createMocks({ name: '', age: -1 });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as ValidationError;
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Request validation failed');
  });

  it('validates query when target is query', () => {
    const { req, res, next } = createMocks();
    req.query = { page: '1' } as Request['query'];
    const querySchema = z.object({ page: z.coerce.number() });

    validate(querySchema, 'query')(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ page: 1 });
  });
});
