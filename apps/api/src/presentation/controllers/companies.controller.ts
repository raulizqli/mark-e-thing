// apps/api/src/presentation/controllers/companies.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreateCompanyUseCase } from '@application/use-cases/companies/create-company.use-case.js';
import { DeleteCompanyUseCase } from '@application/use-cases/companies/delete-company.use-case.js';
import { GetCompanyUseCase } from '@application/use-cases/companies/get-company.use-case.js';
import { ListCompaniesUseCase } from '@application/use-cases/companies/list-companies.use-case.js';
import { UpdateCompanyUseCase } from '@application/use-cases/companies/update-company.use-case.js';
import type { CreateCompanyInput, UpdateCompanyInput } from '@application/dto/company.dto.js';
import type { RequestWithUser } from '../middleware/dev-user.middleware.js';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly listCompanies: ListCompaniesUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly getCompany: GetCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
    private readonly deleteCompany: DeleteCompanyUseCase,
  ) {}

  @Get()
  async list(@Req() req: RequestWithUser) {
    const data = await this.listCompanies.execute(req.user!.id);
    return { success: true, data };
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() body: CreateCompanyInput) {
    const data = await this.createCompany.execute(req.user!.id, body);
    return { success: true, data };
  }

  @Get(':id')
  async get(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.getCompany.execute(req.user!.id, id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateCompanyInput,
  ) {
    const data = await this.updateCompany.execute(req.user!.id, id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.deleteCompany.execute(req.user!.id, id);
    return { success: true, data: { deleted: true } };
  }
}
