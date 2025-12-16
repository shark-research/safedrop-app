import { Module } from '@nestjs/common';
import { OkxService } from './okx.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [OkxService],
  exports: [OkxService],
})
export class OkxModule {}
