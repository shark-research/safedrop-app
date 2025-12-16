import {BadRequestException, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BingxService {
  private logger = new Logger('BingxService');
  private readonly BINGX_API_URL = 'https://open-api.bingx.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async checkWallet(key: string, secret: string, wallet: string) {
    const now = Date.now();
    const YEARS_MS =
      Number(this.configService.get('YEARS') || 1) * 365 * 24 * 60 * 60 * 1000;
    const MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    let startTime = now - MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const timestamp = Date.now();

      const endTime = startTime + MONTHS_MS;

      const params = `timestamp=${timestamp}&startTime=${startTime}&endTime=${endTime}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(params)
        .digest('hex');

      const url = `${this.BINGX_API_URL}/openApi/api/v3/capital/withdraw/history?${params}&signature=${signature}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'X-BX-APIKEY': key },
        });
        const data = await response.json();

        if (data?.code && data?.msg) {
          throw new BadRequestException(
            'BingX API error', {
              description: data.msg,
            });
        }

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting BingX API',
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
      startTime -= MONTHS_MS;
    }

    return {
      found: false,
    };
  }
}
