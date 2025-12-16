import { Module } from '@nestjs/common';
import { MexcService } from './mexc.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MexcService],
  exports: [MexcService],
})
export class MexcModule {}
