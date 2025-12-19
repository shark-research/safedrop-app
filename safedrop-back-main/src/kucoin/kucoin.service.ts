import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { fetchWithTimeout } from '../common/http/fetch-with-timeout';

@Injectable()
export class KucoinService {
  private logger = new Logger('KucoinService');
  private readonly KUCOIN_API_URL = 'https://api.kucoin.com';

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
    const MONTHS_MS = 30 * 24 * 60 * 60 * 1000;
    let startTime = now - MONTHS_MS;

    while (startTime > now - YEARS_MS) {
      const response = await fetchWithTimeout(`${this.KUCOIN_API_URL}/api/v1/timestamp`);
      const data = await response.json();
      const timestamp = data.data;

      const endTime = startTime + MONTHS_MS;

      const endpoint = '/api/v1/withdrawals';
      const queryString = `timestamp=${timestamp}&startAt=${startTime}&endAt=${endTime}`;
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(timestamp + 'GET' + endpoint + '?' + queryString)
        .digest('base64');

      const passphraseSignature = crypto
        .createHmac('sha256', apiSecret)
        .update(passphrase)
        .digest('base64');

      try {
        const response = await fetchWithTimeout(
          `${this.KUCOIN_API_URL}${endpoint}?${queryString}`,
          {
            method: 'GET',
            headers: {
              'KC-API-KEY': apiKey,
              'KC-API-SIGN': signature,
              'KC-API-TIMESTAMP': timestamp,
              'KC-API-PASSPHRASE': passphraseSignature,
              'KC-API-KEY-VERSION': '2',
            },
          },
        );
        const data = await response.json();

        if (data?.code && data.code !== '200000') {
          throw new BadRequestException(
            'KuCoin API error', {
              description: data.msg,
            });
        }

        if (!response.ok) {
          throw new BadRequestException({
            message: 'Error requesting KuCoin API',
            status: response.status,
            body: data,
          });
        }

        if (!data.data) {
          return { found: false };
        }

        if (
          data.data.items.some(
            (el) => el.address.toLowerCase() === wallet.toLowerCase(),
          )
        ) {
          return { found: true };
        }
      } catch (error) {
        this.logger.error(error);
        if (error instanceof HttpException) {
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
