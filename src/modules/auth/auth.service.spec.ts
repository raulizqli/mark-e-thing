// src/modules/auth/auth.service.spec.ts
import { SignJWT } from 'jose';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { AuthService } from './auth.service.js';
import type { UserRepository } from './user.repository.js';

const secret = 'test-supabase-jwt-secret-at-least-32-chars';
const encoder = new TextEncoder();

async function signToken(claims: Record<string, unknown>): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(claims.sub))
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encoder.encode(secret));
}

describe('AuthService', () => {
  it('verifies a valid Supabase-style access token and upserts the user', async () => {
    const upsertFromAuth = vi.fn().mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      role: 'USER',
    });
    const userRepository = { upsertFromAuth } as unknown as UserRepository;
    const service = new AuthService(
      userRepository,
      secret,
      'https://example.supabase.co',
    );

    const token = await signToken({
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      role: 'authenticated',
    });

    const auth = await service.authenticateBearerToken(token);

    expect(auth).toEqual({
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      role: 'USER',
    });
    expect(upsertFromAuth).toHaveBeenCalledWith({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      name: null,
    });
  });

  it('rejects expired tokens', async () => {
    const userRepository = {
      upsertFromAuth: vi.fn(),
    } as unknown as UserRepository;
    const service = new AuthService(
      userRepository,
      secret,
      'https://example.supabase.co',
    );

    const token = await new SignJWT({
      email: 'user@example.com',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('11111111-1111-1111-1111-111111111111')
      .setIssuedAt()
      .setExpirationTime('-1h')
      .sign(encoder.encode(secret));

    await expect(service.authenticateBearerToken(token)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('rejects tokens without email', async () => {
    const userRepository = {
      upsertFromAuth: vi.fn(),
    } as unknown as UserRepository;
    const service = new AuthService(
      userRepository,
      secret,
      'https://example.supabase.co',
    );

    const token = await signToken({
      sub: '11111111-1111-1111-1111-111111111111',
    });

    await expect(service.authenticateBearerToken(token)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
