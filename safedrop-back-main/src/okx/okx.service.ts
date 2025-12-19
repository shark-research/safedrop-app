import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OkxService {
  private logger = new Logger('OkxService');
  private readonly OKX_API_URL = 'https://www.okx.com';

  constructor(
    private readonly configService: ConfigService,
  ) { }

  /**
   * Generate OKX API signature
   * Format: Base64(HMAC-SHA256(timestamp + method + requestPath + body, secretKey))
   * For GET requests, requestPath includes query string, body is empty string
   */
  private generateSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string,
    secretKey: string,
  ): string {
    const prehash = timestamp + method.toUpperCase() + requestPath + body;
    return crypto
      .createHmac('sha256', secretKey)
      .update(prehash)
      .digest('base64');
  }

  async checkWallet(
    apiKey: string,
    apiSecret: string,
    passphrase: string,
    wallet: string,
  ) {
    this.logger.log(`=== Starting OKX verification for wallet: ${wallet.slice(0, 8)}... ===`);

    // First, let's just test the API connection with a simple request
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const requestPath = '/api/v5/asset/withdrawal-history';
    const body = ''; // Empty for GET requests

    // Generate signature: timestamp + method + requestPath + body
    const signature = this.generateSignature(timestamp, method, requestPath, body, apiSecret);

    this.logger.log(`Timestamp: ${timestamp}`);
    this.logger.log(`Request: ${method} ${requestPath}`);
    this.logger.log(`API Key: ${apiKey.slice(0, 8)}...`);

    try {
      const response = await fetch(`${this.OKX_API_URL}${requestPath}`, {
        method: method,
        headers: {
          'OK-ACCESS-KEY': apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': passphrase,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      this.logger.log(`Response status: ${response.status}`);
      this.logger.log(`Response code: ${data.code}, msg: ${data.msg}`);

      // Check for OKX API errors
      if (data.code !== '0') {
        this.logger.error(`OKX API Error - Code: ${data.code}, Message: ${data.msg}`);

        // Common OKX error codes
        const errorMessages: Record<string, string> = {
          '50102': 'Timestamp expired - check server time sync',
          '50111': 'Invalid passphrase',
          '50113': 'Invalid signature',
          '50114': 'Invalid API key',
        };

        throw new BadRequestException({
          message: errorMessages[data.code] || data.msg || 'OKX API error',
          code: data.code,
        });
      }

      // If we get here, credentials are valid
      this.logger.log(`OKX credentials verified successfully!`);

      // Check withdrawal history for wallet
      if (data.data && data.data.length > 0) {
        const found = data.data.some(
          (el: any) => el.to?.toLowerCase() === wallet.toLowerCase()
        );

        if (found) {
          this.logger.log(`Wallet ${wallet.slice(0, 8)}... found in withdrawal history!`);
          return { found: true };
        }
      }

      this.logger.log(`Wallet ${wallet.slice(0, 8)}... not found in recent withdrawals`);
      return { found: false };

    } catch (error) {
      this.logger.error(`OKX verification failed: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        message: 'Failed to verify OKX credentials',
        error: error.message,
      });
    }
  }
}
