// src/modules/auth/auth.service.ts
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../../config/env.config.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import type { AuthenticatedUser, VerifiedTokenClaims } from './auth.types.js';
import { UserRepository } from './user.repository.js';

const textEncoder = new TextEncoder();

export class AuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly jwtSecret: string = env.SUPABASE_JWT_SECRET,
    private readonly supabaseUrl: string = env.SUPABASE_URL,
  ) {}

  async authenticateBearerToken(token: string): Promise<AuthenticatedUser> {
    const claims = await this.verifyAccessToken(token);
    const user = await this.userRepository.upsertFromAuth({
      id: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async verifyAccessToken(token: string): Promise<VerifiedTokenClaims> {
    try {
      const { payload } = await this.verifyWithSecret(token);
      return this.toClaims(payload);
    } catch (secretError) {
      try {
        const { payload } = await this.verifyWithJwks(token);
        return this.toClaims(payload);
      } catch {
        throw new UnauthorizedError(
          secretError instanceof Error
            ? `Invalid or expired token: ${secretError.message}`
            : 'Invalid or expired token',
        );
      }
    }
  }

  private async verifyWithSecret(token: string) {
    return jwtVerify(token, textEncoder.encode(this.jwtSecret), {
      algorithms: ['HS256'],
    });
  }

  private async verifyWithJwks(token: string) {
    if (!this.jwks) {
      const jwksUrl = new URL(
        '/auth/v1/.well-known/jwks.json',
        this.supabaseUrl,
      );
      this.jwks = createRemoteJWKSet(jwksUrl);
    }

    return jwtVerify(token, this.jwks);
  }

  private toClaims(payload: JWTPayload): VerifiedTokenClaims {
    const sub = payload.sub;
    if (!sub) {
      throw new UnauthorizedError('Token missing subject');
    }

    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload.user_metadata === 'object' &&
            payload.user_metadata !== null &&
            typeof (payload.user_metadata as { email?: unknown }).email ===
              'string'
          ? (payload.user_metadata as { email: string }).email
          : null;

    if (!email) {
      throw new UnauthorizedError('Token missing email claim');
    }

    const name =
      typeof payload.user_metadata === 'object' &&
      payload.user_metadata !== null &&
      typeof (payload.user_metadata as { full_name?: unknown }).full_name ===
        'string'
        ? (payload.user_metadata as { full_name: string }).full_name
        : undefined;

    return { sub, email, name };
  }
}
