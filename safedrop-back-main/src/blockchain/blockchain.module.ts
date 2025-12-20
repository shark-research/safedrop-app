import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { FileLoggerModule } from '../logger/file-logger.module';
import { BLOCKCHAIN_SERVICE } from '../verification/verification.tokens';

@Module({
  imports: [ConfigModule, FileLoggerModule],
  providers: [
    {
      provide: BLOCKCHAIN_SERVICE,
      useClass: BlockchainService,
    },
  ],
  exports: [BLOCKCHAIN_SERVICE],
})
export class BlockchainModule {}
