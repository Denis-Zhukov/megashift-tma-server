import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TmaGuard } from './utils/guards/tma.guard';
import { WinstonLogger } from './logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalGuards(new TmaGuard());

  const logger = new WinstonLogger();
  app.useLogger(logger);

  await app.listen(8000);
}
bootstrap();
