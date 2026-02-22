import { Controller, Post, Req, Res } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Bot, webhookCallback } from 'grammy';
import { Request, Response } from 'express';
import { TELEGRAM_BOT } from './telegram-bot.provider';

@Controller('telegram')
export class TelegramController {
  constructor(@Inject(TELEGRAM_BOT) private bot: Bot) {}

  @Post('webhook')
  webhook(@Req() req: Request, @Res() res: Response) {
    const callback = webhookCallback(this.bot, 'express');
    return callback(req, res);
  }
}
