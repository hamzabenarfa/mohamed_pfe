import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: 'Set-Cookie',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Content-Type',
      'Authorization',
    ],
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
