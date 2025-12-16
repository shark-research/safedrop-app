import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BitgetService {
  private logger = new Logger('BitgetService');
  private readonly BITGET_API_URL = 'https://api.bitget.com';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async checkWallet(
    key: string,
    secret: string,
    passphrase: string,
    wallet: string,
  ) {
    const now = Date.now();
    const YEARS_MS =
      Number(this.configService.get('YEARS') || 1) * 365 * 24 * 60 * 60 * 1000;
    const MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
    let startTime = now - MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const endTime = startTime + MONTHS_MS;
      const timestamp = Date.now().toString();
      const method = 'GET';
      const requestPath = `/api/v2/spot/wallet/withdrawal-records?startTime=${startTime}&endTime=${endTime}`;
      const prehashString = timestamp + method + requestPath;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(prehashString)
        .digest('base64');

      const url = `${this.BITGET_API_URL}${requestPath}`;

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'ACCESS-KEY': key,
            'ACCESS-SIGN': signature,
            'ACCESS-TIMESTAMP': timestamp,
            'ACCESS-PASSPHRASE': passphrase,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (data?.code && data?.msg) {
          throw new BadRequestException(
            'Bitget API error', {
              description: data.msg,
            });
        }

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting Bitget API',
            status: response.status,
            body: data,
          });
        }

        if (
          data.data.some(
            (el) => el.toAddress.toLowerCase() === wallet.toLowerCase(),
          )
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
        throw new BadRequestException(error);
      }
      startTime -= MONTHS_MS;
    }

    return {
      found: false,
    };
  }
}
