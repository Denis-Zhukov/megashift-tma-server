import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { TELEGRAM_BOT } from './telegram-bot.provider';
import { run } from '@grammyjs/runner';

@Injectable()
export class TelegramLifecycleService implements OnModuleInit, OnModuleDestroy {
  private readonly mode: 'polling' | 'webhook';
  private runner?: ReturnType<typeof run>;

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
      this.runner = run(this.bot);
      this.runner.start();
      console.log('Telegram bot started in polling mode');
    }

    if (this.mode === 'webhook') {
      const url = this.config.get<string>('TELEGRAM_WEBHOOK_URL');
      if (!url) throw new Error('TELEGRAM_WEBHOOK_URL missing');

      await this.bot.api.setWebhook(url);
      console.log('Telegram bot started in webhook mode');
    }
  }

  async onModuleDestroy() {
    if (this.mode === 'polling' && this.runner) {
      await this.runner.stop();
      console.log('Telegram bot stopped (polling)');
    }

    if (this.mode === 'webhook') {
      await this.bot.api.deleteWebhook();
      console.log('Telegram webhook removed');
    }
  }
}
