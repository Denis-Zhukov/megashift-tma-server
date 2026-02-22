import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TmaGuard } from './utils/guards/tma.guard';
import { WinstonLogger } from './logger/winston-logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WinstonLogger);

  app.useLogger(logger);

  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  app.use(helmet());

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      handler: () => {
        throw new HttpException(
          'Слишком много запросов, попробуйте позже',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      },
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

  app.useGlobalGuards(new TmaGuard(['/telegram/webhook']));

  await app.listen(Number(process.env.PORT) || 8000);
  logger.log('Application is running on port 8000');
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});
