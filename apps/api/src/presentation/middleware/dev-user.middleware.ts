// apps/api/src/presentation/middleware/dev-user.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import type { DevUser } from '../services/dev-user-bootstrap.service';

export type RequestWithUser = Request & { user?: DevUser };

@Injectable()
export class DevUserMiddleware implements NestMiddleware {
  use(req: RequestWithUser, _res: Response, next: NextFunction): void {
    req.user = {
      id: env.DEV_USER_ID,
      email: env.DEV_USER_EMAIL,
      name: env.DEV_USER_NAME,
    };
    next();
  }
}
