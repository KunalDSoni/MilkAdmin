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
  // Allow local dev clients (Expo web, admin web on localhost) to call the API.
  // Bearer-token auth, so no cookies/credentials needed. Tighten per env in prod.
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Input validation is handled per-route by ZodValidationPipe (Zod is our
  // single source of truth). z.object() strips unknown keys, preventing
  // mass-assignment — so no class-validator-based global pipe is needed.
  app.enableShutdownHooks();

  // Honour the platform-injected PORT first (Render, Cloud Run, Heroku, Fly all
  // route to it); fall back to API_PORT for local/Docker, then 4000.
  const port = process.env.PORT
    ? Number(process.env.PORT)
    : config.get<number>('API_PORT', 4000);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`Moderns Milk API listening on :${port}`);
}

void bootstrap();
