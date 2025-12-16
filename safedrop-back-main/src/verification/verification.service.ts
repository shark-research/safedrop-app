import { Injectable } from '@nestjs/common';
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
  ) {}

  async verification(data: VerificationDto) {
    switch (data.exchange) {
      case 'binance':
        return this.binanceService.checkWallet(
          data.key,
          data.secret,
          data.wallet,
        );
      case 'bingx':
        return this.bingxService.checkWallet(
          data.key,
          data.secret,
          data.wallet,
        );
      case 'bitget':
        return this.bitgetService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
      case 'bybit':
        return this.bybitService.checkWallet(
          data.key,
          data.secret,
          data.wallet,
        );
      case 'gate':
        return this.gateService.checkWallet(data.key, data.secret, data.wallet);
      case 'kraken':
        return this.krakenService.checkWallet(
          data.key,
          data.secret,
          data.wallet,
        );
      case 'kucoin':
        return this.kucoinService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
      case 'mexc':
        return this.mexcService.checkWallet(data.key, data.secret, data.wallet);
      case 'okx':
        return this.okxService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
    }
  }
}
