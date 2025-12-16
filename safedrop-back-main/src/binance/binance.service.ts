import {BadRequestException, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BinanceService {
  private logger = new Logger();
  private readonly BINANCE_API_URL = 'https://api.binance.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async checkWallet(key: string, secret: string, wallet: string) {
    const now = Date.now();
    const YEARS_MS =
      Number(this.configService.get('YEARS') || 1) * 365 * 24 * 60 * 60 * 1000;
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    let startTime = now - THREE_MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const response = await fetch(`${this.BINANCE_API_URL}/api/v3/time`);
      const data = await response.json();
      const currentTimestamp = data.serverTime;

      const endTime = startTime + THREE_MONTHS_MS;

      const params = `timestamp=${currentTimestamp}&startTime=${startTime}&endTime=${endTime}&status=6`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(params)
        .digest('hex');

      const url = `${this.BINANCE_API_URL}/sapi/v1/capital/withdraw/history?${params}&signature=${signature}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'X-MBX-APIKEY': key },
        });

        const data = await response.json();

        if (data?.code && data?.msg) {
          throw new BadRequestException(
            'Binance API error', {
            description: data.msg,
          });
        }

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting Binance API',
            status: response.status,
            body: data,
          });
        }

        if (
          data.some((el) => el.address.toLowerCase() === wallet.toLowerCase())
        ) {
          return {
            found: true,
          };
        }
      } catch (error) {
        this.logger.error(error);
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException(error);
      }

      startTime -= THREE_MONTHS_MS;
    }

    return {
      found: false,
    };
  }
}
