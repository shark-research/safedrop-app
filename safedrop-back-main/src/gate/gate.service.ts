import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class GateService {
  private logger = new Logger('GateService');
  private readonly GATE_API_URL = 'https://api.gateio.ws';

  constructor() {}

  async checkWallet(apiKey: string, apiSecret: string, wallet: string) {
    const timestamp = (Date.now() / 1000).toString();
    const hashedPayload = crypto.createHash('sha512').digest('hex');

    const s = [
      'GET',
      '/api/v4/wallet/withdrawals',
      '',
      hashedPayload,
      timestamp,
    ].join('\n');

    const signature = crypto
      .createHmac('sha512', apiSecret)
      .update(s)
      .digest('hex');

    const url = `${this.GATE_API_URL}/api/v4/wallet/withdrawals`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          KEY: apiKey,
          SIGN: signature,
          Timestamp: timestamp.toString(),
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data?.label || data?.message) {
        throw new BadRequestException(
          'Gate.io API error', {
            description: data.message,
          });
      }

      if (!response.ok) {
        throw new BadRequestException({
          message: 'Error requesting Gate.io API',
          status: response.status,
          body: data,
        });
      }

      if (!Array.isArray(data)) {
        return { found: false };
      }

      const found = data.some(
        (el) => el.address.toLowerCase() === wallet.toLowerCase(),
      );

      return { found };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
