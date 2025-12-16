import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ORIGIN.split(','),
    credentials: true,
    methods: ['POST'],
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
