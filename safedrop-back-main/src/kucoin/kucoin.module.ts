import { Module } from '@nestjs/common';
import { KucoinService } from './kucoin.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [KucoinService],
  exports: [KucoinService],
})
export class KucoinModule {}
