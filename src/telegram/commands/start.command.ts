import { Injectable } from '@nestjs/common';
import { Context, InlineKeyboard } from 'grammy';
import { TelegramCommand } from '../decorators/telegram-command.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
@TelegramCommand('start', 'help')
export class StartCommand {
  constructor(private readonly config: ConfigService) {}

  async execute(ctx: Context) {
    const first = ctx.from?.first_name?.trim();
    const last = ctx.from?.last_name?.trim();
    const username = ctx.from?.username?.trim();
    const fullName =
      [first, last].filter(Boolean).join(' ') ||
      (username ? `@${username}` : 'Пользователь');

    const text = [
      `Привет, ${fullName}! 👋`,
      ``,
      `<b>Добро пожаловать в Megashift</b> — ваш помощник в планировании смен и графиков! 🚀`,
      ``,
      `🔔 <b>Уведомления</b> — не пропустите смену, даже если вы заняты`,
      `🔁 <b>Обмен смен</b> — мгновенно договаривайтесь с коллегами`,
      `📊 <b>Статистика часов</b> — полный контроль над вашим рабочим временем`,
      ``,
      `💡 Все действия проходят через <b>Telegram Mini App</b> — никаких лишних сообщений, только удобство и скорость.`,
      `Нажмите кнопку ниже, чтобы открыть приложение и начать планировать свои смены прямо сейчас! 🏃‍♂️💨`,
    ].join('\n');

    const WEB_APP_URL = this.config.get<string>('WEB_APP_URL');

    const replyOptions: Parameters<(typeof ctx)['reply']>[1] = {
      parse_mode: 'HTML',
    };

    if (WEB_APP_URL) {
      replyOptions.reply_markup = new InlineKeyboard()
        .webApp('Открыть Megashift', WEB_APP_URL)
        .primary();
    }

    await ctx.reply(text, replyOptions);
  }
}
