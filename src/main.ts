// Polyfill for crypto.randomUUID in Node.js < 19
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = require('crypto');
}
if (typeof (global as any).crypto.randomUUID === 'undefined') {
  (global as any).crypto.randomUUID = () =>
    require('crypto').randomBytes(16).toString('hex');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log'],
  });

  app.enableCors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT! ?? 3000);
}
bootstrap();
