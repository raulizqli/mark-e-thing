// apps/api/src/app.module.ts

import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module.js';
import { ApplicationModule } from '@application/application.module.js';
import { PresentationModule } from '@presentation/presentation.module.js';

@Module({
  imports: [InfrastructureModule, ApplicationModule, PresentationModule],
})
export class AppModule {}
