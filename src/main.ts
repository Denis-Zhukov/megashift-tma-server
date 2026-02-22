import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TmaGuard } from './utils/guards/tma.guard';
import { WinstonLogger } from './logger/winston-logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import * as process from 'node:process';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WinstonLogger);
  const config = app.get(ConfigService);

  app.useLogger(logger);

  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(helmet({}));

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));

  const excludePaths = ['/telegram/webhook', '/health'];
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      handler: (_, res) => {
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests',
        });
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => excludePaths.includes(req.path),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalGuards(new TmaGuard(excludePaths));

  const port = config.get<string | number>('PORT', 8000);
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});
