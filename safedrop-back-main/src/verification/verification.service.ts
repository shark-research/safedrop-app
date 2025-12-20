import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { VerificationDto } from './dto/verification.dto';
import { BinanceService } from '../binance/binance.service';
import { BingxService } from '../bingx/bingx.service';
import { BitgetService } from '../bitget/bitget.service';
import { BybitService } from '../bybit/bybit.service';
import { GateService } from '../gate/gate.service';
import { KrakenService } from '../kraken/kraken.service';
import { KucoinService } from '../kucoin/kucoin.service';
import { MexcService } from '../mexc/mexc.service';
import { OkxService } from '../okx/okx.service';
import { FileLoggerService } from '../logger/file-logger.service';
import { BLOCKCHAIN_SERVICE, GRIND_WALLET_REPOSITORY, PROJECT_INTEGRATION_SERVICE } from './verification.tokens';
import { BlockchainService, ChainType } from './interfaces/blockchain.interface';
import { GrindWalletRecord, GrindWalletRepository } from './interfaces/grind-wallet-repository.interface';
import { ProjectIntegrationService } from './interfaces/project-integration.interface';

@Injectable()
export class VerificationService {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly bingxService: BingxService,
    private readonly bitgetService: BitgetService,
    private readonly bybitService: BybitService,
    private readonly gateService: GateService,
    private readonly krakenService: KrakenService,
    private readonly kucoinService: KucoinService,
    private readonly mexcService: MexcService,
    private readonly okxService: OkxService,
    private readonly configService: ConfigService,
    @Inject(BLOCKCHAIN_SERVICE)
    private readonly blockchainService: BlockchainService,
    @Inject(GRIND_WALLET_REPOSITORY)
    private readonly grindWalletRepository: GrindWalletRepository,
    @Inject(PROJECT_INTEGRATION_SERVICE)
    private readonly projectIntegrationService: ProjectIntegrationService,
    private readonly fileLogger: FileLoggerService,
  ) {}

  async linkGrindWallet(input: {
    grindAddress: string;
    vaultAddress: string;
    projectId: string;
    chain: ChainType;
    vaultSignature: string;
    grindSignature: string;
    nonce: string;
    timestamp: string;
  }): Promise<{
    status: 'linked';
    grindAddress: string;
    vaultAddress: string;
    projectId: string;
    chain: ChainType;
    linkedAt: string;
  }> {
    this.assertNonEmpty(input.grindAddress, 'grindAddress');
    this.assertNonEmpty(input.vaultAddress, 'vaultAddress');
    this.assertNonEmpty(input.projectId, 'projectId');
    this.assertNonEmpty(input.vaultSignature, 'vaultSignature');
    this.assertNonEmpty(input.grindSignature, 'grindSignature');
    this.assertNonEmpty(input.nonce, 'nonce');
    this.assertNonEmpty(input.timestamp, 'timestamp');

    const ctx = `[LINK_GRIND] vault=${this.mask(input.vaultAddress)} grind=${this.mask(input.grindAddress)} chain=${input.chain}`;
    this.fileLogger.info(`${ctx} start`);

    try {
      // 1) RPC check: Grind must be new (no history + zero balance)
      const [history, balance] = await Promise.all([
        this.rpcWithRetry(() =>
          this.blockchainService.getTransactionHistory(input.grindAddress, input.chain, {
            limit: 1,
            timeoutMs: this.rpcTimeoutMs(),
          }),
        ),
        this.rpcWithRetry(() =>
          this.blockchainService.getBalance(input.grindAddress, input.chain, {
            timeoutMs: this.rpcTimeoutMs(),
          }),
        ),
      ]);

      if (history.length > 0) {
        throw new GrindWalletNotNewError('GRIND_HISTORY_NOT_EMPTY');
      }
      if (balance.amount !== 0n) {
        throw new GrindWalletNotNewError('GRIND_BALANCE_NONZERO');
      }

      // 2) DB check: Grind wallet must be unused
      const existing = await this.grindWalletRepository.findGrindWallet(input.grindAddress);
      if (existing) {
        throw new GrindWalletAlreadyUsedError();
      }

      // 3) Signature check: both wallets must be controlled by user
      const message = this.buildLinkMessage(input);
      const [grindOk, vaultOk] = await Promise.all([
        this.blockchainService.verifySig({
          address: input.grindAddress,
          chain: input.chain,
          message,
          signature: input.grindSignature,
        }),
        this.blockchainService.verifySig({
          address: input.vaultAddress,
          chain: input.chain,
          message,
          signature: input.vaultSignature,
        }),
      ]);

      if (!grindOk) {
        throw new SignatureVerificationFailedError('GRIND');
      }
      if (!vaultOk) {
        throw new SignatureVerificationFailedError('VAULT');
      }

      const linkedAt = new Date().toISOString();
      const record: GrindWalletRecord = {
        grindAddress: input.grindAddress,
        vaultHash: this.hashAddress(input.vaultAddress),
        projectId: input.projectId,
        chain: input.chain,
        linkedAt,
        messageHash: this.hashMessage(message),
      };

      await this.grindWalletRepository.withTransaction(async (tx) => {
        const recheck = await this.grindWalletRepository.findGrindWallet(input.grindAddress, tx);
        if (recheck) {
          throw new GrindWalletAlreadyUsedError();
        }
        await this.grindWalletRepository.createGrindWalletLink(record, tx);
      });

      // 4) Only then push to partner (no honeypot)
      await this.projectIntegrationService.pushGrindVaultPair({
        vaultAddress: input.vaultAddress,
        grindAddress: input.grindAddress,
        projectId: input.projectId,
        chain: input.chain,
        linkedAt,
      });

      this.fileLogger.info(`${ctx} linked`);
      return {
        status: 'linked',
        grindAddress: input.grindAddress,
        vaultAddress: input.vaultAddress,
        projectId: input.projectId,
        chain: input.chain,
        linkedAt,
      };
    } catch (error: unknown) {
      const err = this.toError(error);
      this.fileLogger.error(`${ctx} error=${err.message}`);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new LinkGrindInternalError(err.message);
    }
  }

  async verification(data: VerificationDto) {
    const maskedKey = data.key ? `${data.key.slice(0, 4)}...${data.key.slice(-4)}` : 'N/A';
    this.fileLogger.info(
      `[VERIFICATION] exchange=${data.exchange} wallet=${data.wallet} key=${maskedKey}`,
    );

    let result: { found: boolean };
    switch (data.exchange) {
      case 'binance':
        result = await this.binanceService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'bingx':
        result = await this.bingxService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'bitget':
        result = await this.bitgetService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
        break;
      case 'bybit':
        result = await this.bybitService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'gate':
        result = await this.gateService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'kraken':
        result = await this.krakenService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'kucoin':
        result = await this.kucoinService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
        break;
      case 'mexc':
        result = await this.mexcService.checkWallet(data.key, data.secret, data.wallet);
        break;
      case 'okx':
        result = await this.okxService.checkWallet(
          data.key,
          data.secret,
          data.passphrase,
          data.wallet,
        );
        break;
      default:
        throw new InvalidRequestError('exchange');
    }

    this.fileLogger.info(`[VERIFICATION] exchange=${data.exchange} found=${result.found}`);
    return result;
  }

  private rpcTimeoutMs(): number {
    return Number(this.configService.get('RPC_TIMEOUT_MS')) || 8000;
  }

  private async rpcWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    const attempts = Number(this.configService.get('RPC_RETRY_MAX')) || 3;
    const delayMs = Number(this.configService.get('RPC_RETRY_DELAY_MS')) || 300;

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await fn();
      } catch (error: unknown) {
        const err = this.toError(error);
        lastError = err;
        if (this.isTimeoutError(err)) {
          this.fileLogger.warn(`[RPC] timeout attempt=${attempt}`);
          if (attempt < attempts) {
            await this.sleep(delayMs);
            continue;
          }
          throw new RPCTimeoutError();
        }
        throw err;
      }
    }

    throw new RPCTimeoutError(lastError?.message);
  }

  private buildLinkMessage(input: {
    grindAddress: string;
    vaultAddress: string;
    projectId: string;
    timestamp: string;
    nonce: string;
  }): string {
    return `SafeDrop: Link Grind ${input.grindAddress} to Vault ${input.vaultAddress} for Project ${input.projectId} at ${input.timestamp} nonce ${input.nonce}`;
  }

  private hashAddress(address: string): string {
    const salt = this.configService.get<string>('ADDRESS_HASH_SALT') || '';
    return crypto.createHash('sha256').update(`${salt}:${address}`).digest('hex');
  }

  private hashMessage(message: string): string {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  private mask(address: string): string {
    return address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
  }

  private assertNonEmpty(value: string, field: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidRequestError(field);
    }
  }

  private isTimeoutError(error: Error): boolean {
    const msg = error.message.toLowerCase();
    return msg.includes('timeout') || msg.includes('timed out') || msg.includes('etimedout');
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error('Unknown error');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class GrindWalletNotNewError extends HttpException {
  constructor(reason: 'GRIND_HISTORY_NOT_EMPTY' | 'GRIND_BALANCE_NONZERO') {
    super({ code: reason, message: 'Grind wallet is not new' }, HttpStatus.BAD_REQUEST);
  }
}

class GrindWalletAlreadyUsedError extends HttpException {
  constructor() {
    super({ code: 'GRIND_ALREADY_USED', message: 'Grind wallet already used' }, HttpStatus.CONFLICT);
  }
}

class SignatureVerificationFailedError extends HttpException {
  constructor(which: 'VAULT' | 'GRIND') {
    super(
      { code: `INVALID_${which}_SIGNATURE`, message: `${which} signature invalid` },
      HttpStatus.BAD_REQUEST,
    );
  }
}

class RPCTimeoutError extends HttpException {
  constructor(detail?: string) {
    super(
      { code: 'RPC_TIMEOUT', message: detail || 'RPC request timed out' },
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

class InvalidRequestError extends HttpException {
  constructor(field: string) {
    super({ code: 'INVALID_REQUEST', message: `${field} is required` }, HttpStatus.BAD_REQUEST);
  }
}

class LinkGrindInternalError extends HttpException {
  constructor(message: string) {
    super({ code: 'LINK_GRIND_INTERNAL', message }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
