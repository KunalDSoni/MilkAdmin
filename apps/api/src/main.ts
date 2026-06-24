import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({ origin: false }); // tighten to the real web/app origins per env
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Input validation is handled per-route by ZodValidationPipe (Zod is our
  // single source of truth). z.object() strips unknown keys, preventing
  // mass-assignment — so no class-validator-based global pipe is needed.
  app.enableShutdownHooks();

  const port = config.get<number>('API_PORT', 4000);
  await app.listen(port);
  new Logger('Bootstrap').log(`Moderns Milk API listening on :${port}`);
}

void bootstrap();
