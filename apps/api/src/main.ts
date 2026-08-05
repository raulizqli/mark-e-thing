// apps/api/src/main.ts

import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from './config/env';
import { AppModule } from './app.module';
import { AppErrorFilter } from '@presentation/filters/app-error.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.WEB_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AppErrorFilter());

  await app.listen(env.API_PORT);
  console.log(`MarkeThing API listening on http://localhost:${env.API_PORT}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
