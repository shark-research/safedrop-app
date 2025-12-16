import { Module } from '@nestjs/common';
import { KrakenService } from './kraken.service';

@Module({
  providers: [KrakenService],
  exports: [KrakenService],
})
export class KrakenModule {}
