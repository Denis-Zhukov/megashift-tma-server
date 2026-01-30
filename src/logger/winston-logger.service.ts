import { LoggerService } from '@nestjs/common';
import { winstonLogger } from './winston.logger';

export class WinstonLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    winstonLogger.info(message, { context: context ?? this.context });
  }
  error(message: any, trace?: string, context?: string) {
    if (trace) {
      winstonLogger.error(message, {
        stack: trace,
        context: context ?? this.context,
      });
    } else {
      winstonLogger.error(message, { context: context ?? this.context });
    }
  }
  warn(message: any, context?: string) {
    winstonLogger.warn(message, { context: context ?? this.context });
  }
  debug?(message: any, context?: string) {
    winstonLogger.debug(message, { context: context ?? this.context });
  }
  verbose?(message: any, context?: string) {
    winstonLogger.verbose(message, { context: context ?? this.context });
  }
}
