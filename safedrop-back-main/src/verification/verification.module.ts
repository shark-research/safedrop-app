import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerificationService } from './verification.service';
import { BinanceModule } from '../binance/binance.module';
import { VerificationController } from './verification.controller';
import { BingxModule } from '../bingx/bingx.module';
import { BitgetModule } from '../bitget/bitget.module';
import { BybitModule } from '../bybit/bybit.module';
import { GateModule } from '../gate/gate.module';
import { KrakenModule } from '../kraken/kraken.module';
import { KucoinModule } from '../kucoin/kucoin.module';
import { MexcModule } from '../mexc/mexc.module';
import { OkxModule } from '../okx/okx.module';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { InternalNetworkGuard } from '../common/guards/internal-network.guard';
import { ConcurrencyGuard } from '../common/guards/concurrency.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PublicVerificationController } from './public-verification.controller';

@Module({
  imports: [
    ConfigModule,
    BinanceModule,
    BingxModule,
    BitgetModule,
    BybitModule,
    GateModule,
    KrakenModule,
    KucoinModule,
    MexcModule,
    OkxModule,
  ],
  controllers: [VerificationController, PublicVerificationController],
  providers: [
    VerificationService,
    ApiKeyGuard,
    RateLimitGuard,
    InternalNetworkGuard,
    ConcurrencyGuard,
    JwtAuthGuard,
  ],
})
export class VerificationModule {}
