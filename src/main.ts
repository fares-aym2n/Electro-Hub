import 'pg';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3001',
  });

  const swagger = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setVersion('1.0')
    .addServer('/')
    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(
    app,
    swagger,
  );

  SwaggerModule.setup('api-docs', app, documentation, {
    jsonDocumentUrl: 'api-docs-json',
    swaggerOptions: {
      url: 'api-docs-json',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
