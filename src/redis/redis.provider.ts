import { createClient } from 'redis';

export const REDIS = Symbol('REDIS');

export const RedisProvider = {
  provide: REDIS,
  useFactory: async () => {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error('REDIS_URL is not defined');

    const client = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          const baseDelay = 1000;
          const expDelay = Math.min(1000 * Math.pow(2, retries), 10000);

          const jitter = Math.floor(Math.random() * baseDelay);
          const delay = expDelay + jitter;

          console.warn(
            `Redis reconnect attempt #${retries}, waiting ${delay}ms (including jitter ${jitter}ms)`,
          );
          return delay;
        },
      },
    });

    client.on('connect', () => console.log('Redis connected'));
    client.on('ready', () => console.log('Redis ready'));
    client.on('error', (err) => console.error('Redis error:', err));
    client.on('end', () => console.warn('Redis connection closed'));

    await client.connect();
    return client;
  },
};
