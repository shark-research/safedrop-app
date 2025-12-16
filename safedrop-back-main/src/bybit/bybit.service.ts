import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class BybitService {
  private logger = new Logger('BybitService');
  private readonly BYBIT_API_URL = 'https://api.bybit.com';

  constructor() {}

  async checkWallet(key: string, secret: string, wallet: string) {
    const recvWindow = 5000;
    let found = false;
    let cursor = '';

    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    let endTime = Date.now();

    while (true) {
      const startTime = endTime - oneMonthMs;
      let iteration = 0;

      do {
        const response = await fetch(`${this.BYBIT_API_URL}/v5/market/time`);
        const data = await response.json();
        const timestamp = data.time.toString();

        const queryParams = new URLSearchParams({
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          limit: '50',
        });
        if (cursor) queryParams.append('cursor', cursor);

        const queryString = queryParams.toString();

        const signPayload = `${timestamp}${key}${recvWindow}${queryString}`;
        const signature = crypto
          .createHmac('sha256', secret)
          .update(signPayload)
          .digest('hex');

        const url = `${this.BYBIT_API_URL}/v5/asset/withdraw/query-record?${queryString}`;

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'X-BAPI-API-KEY': key,
              'X-BAPI-TIMESTAMP': timestamp,
              'X-BAPI-RECV-WINDOW': recvWindow.toString(),
              'X-BAPI-SIGN': signature,
            },
          });

          const data = await response.json();

          if (data?.retCode && data?.retMsg && data.retCode !== 0) {
            throw new BadRequestException(
              'Bybit API error', {
                description: data.retMsg,
              });
          }

          if (!response.ok) {
            throw new BadRequestException({
              message: 'Error requesting Bybit API',
              status: response.status,
              body: data,
            });
          }

          if (
            (!data?.result?.rows?.length && iteration === 0)
          ) {
            return { found: false };
          }

          found = data.result.rows.some(
            (el) => el.toAddress.toLowerCase() === wallet.toLowerCase(),
          );
          if (found) return { found };

          cursor = data.result.nextPageCursor || '';
          iteration++;
        } catch (error) {
          this.logger.error(error);
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(error);
        }
      } while (cursor);

      endTime = startTime;
    }
  }
}
