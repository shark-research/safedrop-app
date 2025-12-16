import { Module } from '@nestjs/common';
import { BitgetService } from './bitget.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BitgetService],
  exports: [BitgetService],
})
export class BitgetModule {}
