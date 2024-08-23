import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

import type { RedisClientOptions } from 'redis';

import { configValidationSchema } from './config.schema';
import { Link } from './links/link.entity';
import { LinksModule } from './links/links.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url:
            configService.get<string>('REDIS_HOST') === 'redis'
              ? `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`
              : configService.get<string>('REDIS_HOST'),
        }),
      }),
      isGlobal: true,
    }),
    LinksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get('MONGO_URI'),
        synchronize: true,
        useUnifiedTopology: true,
        entities: [Link],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: seconds(60),
            limit: 10,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          configService.get('REDIS_HOST'),
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
