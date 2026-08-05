// apps/api/src/presentation/middleware/dev-user.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { DevUserBootstrapService, type DevUser } from '../services/dev-user-bootstrap.service.js';

export type RequestWithUser = Request & { user?: DevUser };

@Injectable()
export class DevUserMiddleware implements NestMiddleware {
  constructor(private readonly bootstrap: DevUserBootstrapService) {}

  use(req: RequestWithUser, _res: Response, next: NextFunction): void {
    req.user = this.bootstrap.getUser();
    next();
  }
}
