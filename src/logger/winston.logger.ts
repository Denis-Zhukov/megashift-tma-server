import { format, createLogger, transports } from 'winston';

const { combine, timestamp, errors, printf, colorize, json } = format;

const isProd = process.env.NODE_ENV === 'production';

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, context, ...meta }) => {
    const ctx = context ? `[${context}] ` : '';
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';

    return `${timestamp} ${level} ${ctx}${stack || message}${metaString}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: isProd ? prodFormat : devFormat,
  defaultMeta: {
    service: 'api-service',
  },
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});