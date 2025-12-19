import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { VerificationDto } from './dto/verification.dto';
import { BinanceService } from '../binance/binance.service';
import { BingxService } from '../bingx/bingx.service';
import { BitgetService } from '../bitget/bitget.service';
import { BybitService } from '../bybit/bybit.service';
import { GateService } from '../gate/gate.service';
import { KrakenService } from '../kraken/kraken.service';
import { KucoinService } from '../kucoin/kucoin.service';
import { MexcService } from '../mexc/mexc.service';
import { OkxService } from '../okx/okx.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly bingxService: BingxService,
    private readonly bitgetService: BitgetService,
    private readonly bybitService: BybitService,
    private readonly gateService: GateService,
    private readonly krakenService: KrakenService,
    private readonly kucoinService: KucoinService,
    private readonly mexcService: MexcService,
    private readonly okxService: OkxService,
  ) { }

  async verification(data: VerificationDto) {
    const maskedKey = data.key ? `${data.key.slice(0, 4)}...${data.key.slice(-4)}` : 'N/A';
    this.logger.log(`[VERIFICATION REQUEST] exchange=${data.exchange}, wallet=${data.wallet}, key=${maskedKey}`);

    try {
      let result;
      switch (data.exchange) {
        case 'binance':
          result = await this.binanceService.checkWallet(
            data.key,
            data.secret,
            data.wallet,
          );
          break;
        case 'bingx':
          result = await this.bingxService.checkWallet(
            data.key,
            data.secret,
            data.wallet,
          );
          break;
        case 'bitget':
          result = await this.bitgetService.checkWallet(
            data.key,
            data.secret,
            data.passphrase,
            data.wallet,
          );
          break;
        case 'bybit':
          result = await this.bybitService.checkWallet(
            data.key,
            data.secret,
            data.wallet,
          );
          break;
        case 'gate':
          result = await this.gateService.checkWallet(data.key, data.secret, data.wallet);
          break;
        case 'kraken':
          result = await this.krakenService.checkWallet(
            data.key,
            data.secret,
            data.wallet,
          );
          break;
        case 'kucoin':
          result = await this.kucoinService.checkWallet(
            data.key,
            data.secret,
            data.passphrase,
            data.wallet,
          );
          break;
        case 'mexc':
          result = await this.mexcService.checkWallet(data.key, data.secret, data.wallet);
          break;
        case 'okx':
          result = await this.okxService.checkWallet(
            data.key,
            data.secret,
            data.passphrase,
            data.wallet,
          );
          break;
        default:
          this.logger.warn(`[VERIFICATION] Unsupported exchange: ${data.exchange}`);
          throw new BadRequestException('Unsupported exchange');
      }

      this.logger.log(`[VERIFICATION SUCCESS] exchange=${data.exchange}, found=${result?.found}`);
      return result;
    } catch (error) {
      this.logger.error(`[VERIFICATION ERROR] exchange=${data.exchange}, error=${error.message}`, error.stack);
      throw error;
    }
  }
}
