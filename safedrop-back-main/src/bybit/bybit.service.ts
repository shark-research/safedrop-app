import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { fetchWithTimeout } from '../common/http/fetch-with-timeout';

@Injectable()
export class BybitService {
  private logger = new Logger('BybitService');
  private readonly BYBIT_API_URL = 'https://api.bybit.com';

  constructor(private readonly configService: ConfigService) {}

  async checkWallet(key: string, secret: string, wallet: string) {
    const recvWindow = 5000;
    const now = Date.now();
    const yearsMs =
      Number(this.configService.get('YEARS') || 1) * 365 * 24 * 60 * 60 * 1000;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const earliestTime = now - yearsMs;
    let endTime = now;

    while (endTime > earliestTime) {
      const startTime = Math.max(endTime - oneMonthMs, earliestTime);
      let cursor = '';
      let iteration = 0;

      do {
        try {
          const timeResponse = await fetchWithTimeout(
            `${this.BYBIT_API_URL}/v5/market/time`,
          );
          const timeData = await timeResponse.json();
          const timestamp = timeData?.time?.toString();

          if (!timestamp) {
            throw new BadRequestException({
              message: 'Bybit API error',
              body: timeData,
            });
          }

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

          const withdrawResponse = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
              'X-BAPI-API-KEY': key,
              'X-BAPI-TIMESTAMP': timestamp,
              'X-BAPI-RECV-WINDOW': recvWindow.toString(),
              'X-BAPI-SIGN': signature,
            },
          });

          const data = await withdrawResponse.json();

          if (data?.retCode && data?.retMsg && data.retCode !== 0) {
            throw new BadRequestException('Bybit API error', {
              description: data.retMsg,
            });
          }

          if (!withdrawResponse.ok) {
            throw new BadRequestException({
              message: 'Error requesting Bybit API',
              status: withdrawResponse.status,
              body: data,
            });
          }

          if (!data?.result?.rows?.length && iteration === 0) {
            return { found: false };
          }

          if (
            data.result.rows.some(
              (el) => el.toAddress.toLowerCase() === wallet.toLowerCase(),
            )
          ) {
            return { found: true };
          }

          cursor = data.result.nextPageCursor || '';
          iteration++;
        } catch (error) {
          this.logger.error(error);
          if (error instanceof HttpException) {
            throw error;
          }
          throw new BadRequestException(error);
        }
      } while (cursor);

      endTime = startTime;
    }

    return { found: false };
  }
}
