// src/modules/auth/auth.middleware.spec.ts
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { createRequireAuth } from './auth.middleware.js';
import type { AuthService } from './auth.service.js';

describe('requireAuth', () => {
  it('attaches auth when Bearer token is valid', async () => {
    const authenticateBearerToken = vi.fn().mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      role: 'USER',
    });
    const authService = { authenticateBearerToken } as unknown as AuthService;
    const requireAuth = createRequireAuth(authService);

    const req = {
      header: vi.fn().mockReturnValue('Bearer good-token'),
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(req.auth).toEqual({
      userId: 'u1',
      email: 'a@b.com',
      role: 'USER',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards UnauthorizedError when header is missing', async () => {
    const authService = {
      authenticateBearerToken: vi.fn(),
    } as unknown as AuthService;
    const requireAuth = createRequireAuth(authService);

    const req = {
      header: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const next = vi.fn() as NextFunction;

    await requireAuth(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
