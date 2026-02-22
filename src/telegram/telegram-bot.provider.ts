import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { limit } from '@grammyjs/ratelimiter';
import { REDIS, RedisProvider } from '../redis/redis.provider';

export const TELEGRAM_BOT = Symbol('TELEGRAM_BOT');

export const telegramBotProvider = {
  provide: TELEGRAM_BOT,
  inject: [ConfigService, REDIS],
  useFactory: async (
    config: ConfigService,
    asyncRedis: ReturnType<typeof RedisProvider.useFactory>,
  ) => {
    const token = config.get<string>('BOT_TOKEN');
    if (!token) throw new Error('BOT_TOKEN missing');
    const bot = new Bot(token);
    const redis = await asyncRedis;

    const rateLimitMiddleware = limit({
      timeFrame: 60 * 1000,
      limit: 5,
      storageClient: {
        incr(key: string): Promise<number> {
          return redis.incr(key) as Promise<number>;
        },
        pexpire(key: string, milliseconds: number): Promise<number> {
          return redis.pExpire(key, milliseconds) as Promise<number>;
        },
      },
      onLimitExceeded: (_, next) => {
        console.warn(`Может не надо спамить? =)`);
        return next();
      },
      keyGenerator: (ctx) => {
        return ctx.from?.id.toString();
      },
    });
    bot.use(rateLimitMiddleware);

    return bot;
  },
};
