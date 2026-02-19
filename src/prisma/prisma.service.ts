import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private reconnecting = false;
  private reconnectPromise?: Promise<void>;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e) {
      this.logger.error(
        'Error disconnecting Prisma client',
        (e as Error).stack,
      );
    }
  }
  private async connectWithRetry(): Promise<void> {
    const maxDelayMs = 30_000;
    const baseDelayMs = 1000;
    let attempt = 0;

    while (true) {
      attempt += 1;
      try {
        this.logger.log(`Prisma connecting... attempt #${attempt}`);
        await this.$connect();
        this.logger.log('Prisma connected.');
        return;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Prisma connect attempt #${attempt} failed: ${errMsg}`,
        );
        const exp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
        const jitter = Math.floor(Math.random() * baseDelayMs);
        const delay = Math.max(500, Math.min(maxDelayMs, exp + jitter));
        this.logger.log(`Waiting ${delay} ms before next attempt...`);
        await this.sleep(delay);
      }
    }
  }

  async reconnect(): Promise<void> {
    if (this.reconnecting) return this.reconnectPromise!;
    this.reconnecting = true;

    this.reconnectPromise = (async () => {
      try {
        try {
          await this.$disconnect();
        } catch (e) {
          this.logger.debug('Disconnect failed (ignored): ' + String(e));
        }
        await this.connectWithRetry();
      } finally {
        this.reconnecting = false;
        this.reconnectPromise = undefined;
      }
    })();

    return this.reconnectPromise;
  }

  async safeExecute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (this.isConnectionError(err)) {
        this.logger.warn(
          `Query failed due to connection error, reconnecting...`,
        );
        await this.reconnect();
        return fn();
      }
      throw err;
    }
  }

  private isConnectionError(err: unknown): boolean {
    if (!err) return false;
    const anyErr = err as any;

    const socketCodes = new Set([
      'ECONNRESET',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'EPIPE',
      'ECONNABORTED',
      'EHOSTUNREACH',
    ]);
    if (anyErr.code && socketCodes.has(anyErr.code)) return true;

    if (
      anyErr.message &&
      /connection (?:reset|refused|terminated)|server closed|socket hang up|failed to connect/i.test(
        anyErr.message,
      )
    )
      return true;

    return !!(anyErr.name && anyErr.name.includes('PrismaClient'));
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
