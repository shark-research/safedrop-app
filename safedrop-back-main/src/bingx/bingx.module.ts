import { Module } from '@nestjs/common';
import { BingxService } from './bingx.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BingxService],
  exports: [BingxService],
})
export class BingxModule {}
