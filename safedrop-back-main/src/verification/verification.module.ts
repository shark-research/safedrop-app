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
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ProjectIntegrationModule } from '../project-integration/project-integration.module';
import { PostgresModule } from '../database/postgres.module';
import { FileLoggerModule } from '../logger/file-logger.module';
import { GRIND_WALLET_REPOSITORY } from './verification.tokens';
import { GrindWalletRepository } from './repositories/grind-wallet.repository';

@Module({
  imports: [
    ConfigModule,
    FileLoggerModule,
    BinanceModule,
    BingxModule,
    BitgetModule,
    BybitModule,
    GateModule,
    KrakenModule,
    KucoinModule,
    MexcModule,
    OkxModule,
    BlockchainModule,
    ProjectIntegrationModule,
    PostgresModule,
  ],
  controllers: [VerificationController, PublicVerificationController],
  providers: [
    VerificationService,
    {
      provide: GRIND_WALLET_REPOSITORY,
      useClass: GrindWalletRepository,
    },
    ApiKeyGuard,
    RateLimitGuard,
    InternalNetworkGuard,
    ConcurrencyGuard,
    JwtAuthGuard,
  ],
})
export class VerificationModule {}
