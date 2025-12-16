import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MexcService {
  private logger = new Logger('MexcService');
  private readonly MEXC_API_URL = 'https://api.mexc.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async checkWallet(apiKey: string, apiSecret: string, wallet: string) {
    const now = Date.now();
    const YEARS_MS = 90 * 24 * 60 * 60 * 1000;
    const MONTHS_MS = 7 * 24 * 60 * 60 * 1000;
    let startTime = now - MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const response = await fetch(`${this.MEXC_API_URL}/api/v3/time`);
      const data = await response.json();
      const timestamp = data.serverTime;

      const endTime = startTime + MONTHS_MS;

      const endpoint = '/api/v3/capital/withdraw/history';
      const queryString = `timestamp=${timestamp}&startTime=${startTime}&endTime=${endTime}`;
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      try {
        const response = await fetch(
          `${this.MEXC_API_URL}${endpoint}?${queryString}&signature=${signature}`,
          {
            method: 'GET',
            headers: {
              'X-MEXC-APIKEY': apiKey,
            },
          },
        );
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new BadRequestException({
            message: 'MEXC API error',
            body: data,
          });
        }

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting MEXC API',
            status: response.status,
            body: data,
          });
        }

        if (
          data.some((el) => el.address.toLowerCase() === wallet.toLowerCase())
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
