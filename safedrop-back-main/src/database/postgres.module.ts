import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { FileLoggerModule } from '../logger/file-logger.module';
import { FileLoggerService } from '../logger/file-logger.service';
import { PG_POOL } from './postgres.tokens';

@Module({
  imports: [ConfigModule, FileLoggerModule],
  providers: [
    {
      provide: PG_POOL,
      useFactory: (configService: ConfigService, logger: FileLoggerService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          logger.error('DATABASE_URL is not set');
          throw new Error('DATABASE_URL is not set');
        }

        const pool = new Pool({
          connectionString,
          max: Number(configService.get('PG_POOL_MAX')) || 10,
        });

        pool.on('error', (error) => {
          logger.error(`Postgres pool error: ${error.message}`);
        });

        return pool;
      },
      inject: [ConfigService, FileLoggerService],
    },
  ],
  exports: [PG_POOL],
})
export class PostgresModule {}
