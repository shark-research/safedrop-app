import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'querystring';
import { fetchWithTimeout } from '../common/http/fetch-with-timeout';

@Injectable()
export class KrakenService {
  private logger = new Logger('KrakenService');
  private readonly KRAKEN_API_URL = 'https://api.kraken.com';

  constructor() {}

  async checkWallet(apiKey: string, apiSecret: string, wallet: string) {
    const path = '/0/private/WithdrawStatus';

    const nonce = Date.now().toString();
    const body = { nonce };
    const urlEncodedData = qs.stringify(body);

    const encodedPayload = nonce + urlEncodedData;
    const sha256hash = crypto
      .createHash('sha256')
      .update(encodedPayload)
      .digest();
    const message = Buffer.concat([Buffer.from(path, 'utf8'), sha256hash]);
    const secret = Buffer.from(apiSecret, 'base64');
    const signature = crypto
      .createHmac('sha512', secret)
      .update(message)
      .digest('base64');

    try {
      const response = await fetchWithTimeout(`${this.KRAKEN_API_URL}${path}`, {
        method: 'POST',
        headers: {
          'API-Key': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'API-Sign': signature,
        },
        body: urlEncodedData,
      });
      const data = await response.json();


      if (data?.error?.length) {
        throw new BadRequestException(
          'Kraken API error', {
            description: data.error?.join(', '),
          });
      }

      if (!response.ok) {
        throw new BadRequestException({
          message: 'Error requesting Kraken API',
          status: response.status,
          body: data,
        });
      }

      if (!data.result) {
        return { found: false };
      }

      const found = data.result.some(
        (el) => el.info.toLowerCase() === wallet.toLowerCase(),
      );

      return { found };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
