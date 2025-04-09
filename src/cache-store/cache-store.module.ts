import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const host = process.env.REDIS_HOST;
        const port = +(process.env.REDIS_PORT ?? '6379');
        const password = process.env.REDIS_PASSWORD;
        const database = +(process.env.REDIS_CACHE_DATABASE_NUMBER ?? '0');

        return {
          store: await redisStore({
            socket: {
              host,
              port,
            },
            password,
            database,
          }),
        };
      },
    }),
  ],

  exports: [NestCacheModule],
})
export class CacheStoreModule {}