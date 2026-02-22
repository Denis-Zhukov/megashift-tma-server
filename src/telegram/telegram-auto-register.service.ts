import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { Bot } from 'grammy';
import { TELEGRAM_COMMAND } from './decorators/telegram-command.decorator';
import { TELEGRAM_BOT } from './telegram-bot.provider';

export interface TelegramCommandInterface {
  execute(ctx: any): Promise<any> | void;
}

@Injectable()
export class TelegramAutoRegisterService implements OnModuleInit {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly moduleRef: ModuleRef,
    @Inject(TELEGRAM_BOT)
    private readonly bot: Bot,
  ) {}

  onModuleInit() {
    for (const [_, module] of this.modulesContainer.entries()) {
      for (const provider of module.providers.values()) {
        const metatype = provider.metatype;

        if (!metatype) continue;

        const commandNames: string[] = Reflect.getMetadata(
          TELEGRAM_COMMAND,
          metatype,
        );
        if (!commandNames || commandNames.length === 0) continue;

        let instance: TelegramCommandInterface;
        try {
          instance = this.moduleRef.get<TelegramCommandInterface>(metatype, {
            strict: false,
          });
        } catch {
          continue;
        }

        if (!instance || typeof instance.execute !== 'function') continue;

        this.bot.command(commandNames, (ctx) => instance.execute(ctx));

        this.bot.on('message', async (ctx) => {
          if (ctx.message?.text) {
            await ctx.reply(
              'Я пока не знаю, что на это ответить 😅\nОткройте Mini App, чтобы управлять сменами!\nЕсли нужна помощь введи /help',
            );
          }
        });
      }
    }
  }
}
