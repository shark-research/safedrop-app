import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const bodyLimit = process.env.REQUEST_BODY_LIMIT || '10kb';
  app.use(json({ limit: bodyLimit }));

  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', true);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const origins = process.env.ORIGIN
    ? process.env.ORIGIN.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST'],
  });

  if (process.env.MODE === 'DEV') {
    const configSwagger = new DocumentBuilder()
      .setTitle('safedrop')
      .setDescription('Open API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup('api/api', app, document);
  }

  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.verbose(`Application is listening on the port ${port}`);
}
bootstrap();
