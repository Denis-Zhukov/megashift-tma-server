import { Module, DynamicModule, Type } from '@nestjs/common';
import { TelegramLifecycleService } from './telegram-lifecycle.service';
import { TelegramAutoRegisterService } from './telegram-auto-register.service';
import { telegramBotProvider, TELEGRAM_BOT } from './telegram-bot.provider';
import * as path from 'path';
import * as fs from 'fs';
import { TelegramController } from './telegram.controller';

@Module({})
export class TelegramModule {
  static async forRoot(): Promise<DynamicModule> {
    const commandsPath = path.resolve(__dirname, 'commands');

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((f) => f.endsWith('command.ts') || f.endsWith('command.js'));

    const commandClasses: Type[] = [];

    for (const file of commandFiles) {
      const moduleExports = await import(path.join(commandsPath, file));
      const classExport = moduleExports[Object.keys(moduleExports)[0]];
      commandClasses.push(classExport);
    }

    return {
      module: TelegramModule,
      controllers: [TelegramController],
      providers: [
        telegramBotProvider,
        TelegramAutoRegisterService,
        TelegramLifecycleService,
        ...commandClasses,
      ],
      exports: [TELEGRAM_BOT],
    };
  }
}
