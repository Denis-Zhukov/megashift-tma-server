import { createClient } from 'redis';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const url = process.env.REDIS_URL;

    if (!url) {
      throw new Error('REDIS_URL is not defined');
    }

    const client = createClient({ url });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await client.connect();

    return client;
  },
};
