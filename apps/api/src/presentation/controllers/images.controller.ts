// apps/api/src/presentation/controllers/images.controller.ts

import { Inject, Body, Controller, Param, Post, Req } from '@nestjs/common';
import { GenerateImageUseCase } from '@application/use-cases/images/generate-image.use-case';
import type { RequestWithUser } from '../middleware/dev-user.middleware';

@Controller('companies/:companyId/images')
export class ImagesController {
  constructor(@Inject(GenerateImageUseCase) private readonly generateImage: GenerateImageUseCase) {}

  @Post('generate')
  async generate(
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
    @Body() body: { prompt: string; contentId?: string },
  ) {
    const data = await this.generateImage.execute(req.user!.id, {
      companyId,
      prompt: body.prompt,
      contentId: body.contentId,
    });
    return { success: true, data };
  }
}
