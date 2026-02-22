import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

export const TELEGRAM_BOT = Symbol('TELEGRAM_BOT');

export const telegramBotProvider = {
  provide: TELEGRAM_BOT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const token = config.get<string>('BOT_TOKEN');
    if (!token) throw new Error('BOT_TOKEN missing');
    return new Bot(token);
  },
};
