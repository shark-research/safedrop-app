import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OkxService {
  private logger = new Logger('OkxService');
  private readonly OKX_API_URL = 'https://www.okx.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async checkWallet(
    apiKey: string,
    apiSecret: string,
    passphrase: string,
    wallet: string,
  ) {
    const now = Date.now();
    const YEARS_MS =
      Number(this.configService.get('YEARS') || 1) * 365 * 24 * 60 * 60 * 1000;
    const MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    let startTime = now - MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const timestamp = new Date().toISOString();
      const endTime = startTime + MONTHS_MS;
      const endpoint = '/api/v5/asset/withdrawal-history';
      const method = 'GET';
      const queryString = `?before=${startTime}&after=${endTime}&state=2`;
      const prehash = timestamp + method + endpoint + queryString;
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(prehash)
        .digest('base64');

      try {
        const response = await fetch(
          `${this.OKX_API_URL}${endpoint}${queryString}`,
          {
            method: 'GET',
            headers: {
              'OK-ACCESS-KEY': apiKey,
              'OK-ACCESS-SIGN': signature,
              'OK-ACCESS-TIMESTAMP': timestamp,
              'OK-ACCESS-PASSPHRASE': passphrase,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting OKX API',
            status: response.status,
            body: data,
          });
        }

        if (!data.data) {
          return { found: false };
        }

        if (
          data.data.some((el) => el.to.toLowerCase() === wallet.toLowerCase())
        ) {
          return { found: true };
        }
      } catch (error) {
        this.logger.error(error);
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(error);
      }

      startTime -= MONTHS_MS;
    }

    return {
      found: false,
    };
  }
}
