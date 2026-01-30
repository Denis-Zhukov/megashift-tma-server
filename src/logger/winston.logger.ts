import { format, createLogger, transports } from 'winston';

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ timestamp, level, message, stack, context }) => {
  return `${timestamp} ${level.toUpperCase()} ${context ? '[' + context + '] ' : ''}${stack ?? message}`;
});

export const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});
