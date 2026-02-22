import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { TELEGRAM_BOT } from './telegram-bot.provider';

@Injectable()
export class TelegramLifecycleService implements OnModuleInit, OnModuleDestroy {
  private readonly mode: 'polling' | 'webhook';

  constructor(
    @Inject(TELEGRAM_BOT) private bot: Bot,
    private readonly config: ConfigService,
  ) {
    this.mode = this.config.get<'polling' | 'webhook'>(
      'TELEGRAM_MODE',
      'polling',
    );
  }

  async onModuleInit() {
    if (this.mode === 'polling') {
      await this.bot.start();
      console.log('Telegram bot started in polling mode');
    }

    if (this.mode === 'webhook') {
      const url = this.config.get<string>('TELEGRAM_WEBHOOK_URL');
      if (!url) throw new Error('TELEGRAM_WEBHOOK_URL missing');

      const result = await this.bot.api.setWebhook(url);
      console.log(
        result
          ? 'Telegram bot started in webhook mode'
          : 'Webhook is not registered',
      );
    }
  }

  async onModuleDestroy() {
    if (this.mode === 'polling') {
      await this.bot.stop();
    }

    if (this.mode === 'webhook') {
      await this.bot.api.deleteWebhook();
    }
  }
}
