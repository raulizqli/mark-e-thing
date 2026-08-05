// src/modules/search/search.controller.ts
import type { Request, Response } from 'express';
import { getAuthUser } from '../auth/auth.middleware.js';
import { successResponse } from '../../shared/http/api-response.js';
import type { CreateSearchDto } from './search.dto.js';
import { SearchService } from './search.service.js';

export class SearchController {
  constructor(private readonly searchService: SearchService = new SearchService()) {}

  async create(req: Request, res: Response): Promise<void> {
    const auth = getAuthUser(req);
    const search = await this.searchService.createSearch(
      auth.userId,
      req.body as CreateSearchDto,
    );
    res.status(201).json(successResponse(search));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const auth = getAuthUser(req);
    const search = await this.searchService.getSearch(req.params.id, auth.userId);
    res.status(200).json(successResponse(search));
  }

  async getStatus(req: Request, res: Response): Promise<void> {
    const auth = getAuthUser(req);
    const status = await this.searchService.getStatus(req.params.id, auth.userId);
    res.status(200).json(successResponse(status));
  }
}
