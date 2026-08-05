// src/modules/auth/auth.types.ts
import type { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export interface VerifiedTokenClaims {
  sub: string;
  email: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
    }
  }
}

export {};
