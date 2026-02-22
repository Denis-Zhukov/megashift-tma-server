import 'reflect-metadata';

export const TELEGRAM_COMMAND = Symbol('TELEGRAM_COMMAND');

export function TelegramCommand(...commands: string[]): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(TELEGRAM_COMMAND, commands, target);
  };
}
