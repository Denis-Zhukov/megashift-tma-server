import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TmaGuard } from './utils/guards/tma.guard';
import { WinstonLogger } from './logger/winston-logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  app.use(helmet());

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      message: 'Слишком много запросов с этого IP, попробуйте позже',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalGuards(new TmaGuard());

  const logger = new WinstonLogger();
  app.useLogger(logger);

  // app.enableCors({
  //   origin: ['https://yourdomain.com'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  await app.listen(8000);
  logger.log('Application is running on port 8000');
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});
