import 'pg';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://unpkg.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://unpkg.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
    }),
  );

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
    .setTitle('ElectroHub API')
    .setDescription(
      'RESTful API for an electronics e-commerce platform',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .addServer(`${process.env.BASE_URL}`)

    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(
    app,
    swagger,
  );

  SwaggerModule.setup('api-docs', app, documentation, {
    customCssUrl:
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
