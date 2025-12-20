import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { fetchWithTimeout } from '../common/http/fetch-with-timeout';
import { FileLoggerService } from '../logger/file-logger.service';
import {
  BalanceResult,
  BlockchainService as BlockchainServiceContract,
  ChainType,
  TransactionRef,
} from '../verification/interfaces/blockchain.interface';

@Injectable()
export class BlockchainService implements BlockchainServiceContract {
  private readonly solanaConnection: Connection;
  private readonly evmProvider: ethers.JsonRpcProvider;
  private readonly historyApiUrl: string;
  private readonly historyApiKey?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly fileLogger: FileLoggerService,
  ) {
    const solanaRpc = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.solanaConnection = new Connection(solanaRpc, 'confirmed');

    const evmRpc = this.configService.get<string>('EVM_RPC_URL') || '';
    this.evmProvider = new ethers.JsonRpcProvider(evmRpc || undefined);

    this.historyApiUrl = this.configService.get<string>('EVM_HISTORY_API_URL') || '';
    this.historyApiKey = this.configService.get<string>('EVM_HISTORY_API_KEY') || undefined;
  }

  async getTransactionHistory(
    address: string,
    chain: ChainType,
    opts?: { limit?: number; timeoutMs?: number },
  ): Promise<ReadonlyArray<TransactionRef>> {
    if (chain === 'solana') {
      return this.getSolanaHistory(address, opts);
    }
    return this.getEvmHistory(address, opts);
  }

  async getBalance(
    address: string,
    chain: ChainType,
    opts?: { timeoutMs?: number },
  ): Promise<BalanceResult> {
    if (chain === 'solana') {
      return this.getSolanaBalance(address, opts);
    }
    return this.getEvmBalance(address, opts);
  }

  async verifySig(input: {
    address: string;
    chain: ChainType;
    message: string;
    signature: string;
  }): Promise<boolean> {
    if (input.chain === 'solana') {
      return this.verifySolanaSig(input.address, input.message, input.signature);
    }
    return this.verifyEvmSig(input.address, input.message, input.signature);
  }

  private async getSolanaHistory(
    address: string,
    opts?: { limit?: number; timeoutMs?: number },
  ): Promise<ReadonlyArray<TransactionRef>> {
    const limit = Math.max(1, opts?.limit ?? 1);
    const publicKey = new PublicKey(address);
    const signatures = await this.withTimeout(
      this.solanaConnection.getSignaturesForAddress(publicKey, { limit }),
      opts?.timeoutMs,
    );
    return signatures.map((sig) => ({ hash: sig.signature }));
  }

  private async getSolanaBalance(
    address: string,
    opts?: { timeoutMs?: number },
  ): Promise<BalanceResult> {
    const publicKey = new PublicKey(address);
    const lamports = await this.withTimeout(
      this.solanaConnection.getBalance(publicKey, 'confirmed'),
      opts?.timeoutMs,
    );
    return { amount: BigInt(lamports), unit: 'lamports' };
  }

  private async getEvmHistory(
    address: string,
    opts?: { limit?: number; timeoutMs?: number },
  ): Promise<ReadonlyArray<TransactionRef>> {
    const normalized = ethers.getAddress(address);
    const limit = Math.max(1, opts?.limit ?? 1);

    if (this.historyApiUrl) {
      const url = new URL(this.historyApiUrl);
      url.searchParams.set('module', 'account');
      url.searchParams.set('action', 'txlist');
      url.searchParams.set('address', normalized);
      url.searchParams.set('page', '1');
      url.searchParams.set('offset', String(limit));
      url.searchParams.set('sort', 'asc');
      if (this.historyApiKey) {
        url.searchParams.set('apikey', this.historyApiKey);
      }

      const response = await fetchWithTimeout(url.toString(), {
        timeoutMs: opts?.timeoutMs,
      });
      const payload = (await response.json()) as { result?: Array<{ hash: string }> };

      if (response.ok && Array.isArray(payload.result)) {
        return payload.result.map((tx) => ({ hash: tx.hash }));
      }

      this.fileLogger.warn('[EVM_HISTORY] history API failed; falling back to txcount');
    }

    // Fallback: tx count only (limited). This is still useful for "new wallet" checks.
    const txCount = await this.withTimeout(this.evmProvider.getTransactionCount(normalized), opts?.timeoutMs);
    return txCount > 0 ? [{ hash: 'txcount' }] : [];
  }

  private async getEvmBalance(
    address: string,
    opts?: { timeoutMs?: number },
  ): Promise<BalanceResult> {
    const normalized = ethers.getAddress(address);
    const balance = await this.withTimeout(this.evmProvider.getBalance(normalized), opts?.timeoutMs);
    return { amount: BigInt(balance.toString()), unit: 'wei' };
  }

  private async verifyEvmSig(address: string, message: string, signature: string): Promise<boolean> {
    const recovered = ethers.verifyMessage(message, signature);
    return ethers.getAddress(recovered) === ethers.getAddress(address);
  }

  private async verifySolanaSig(address: string, message: string, signature: string): Promise<boolean> {
    const publicKey = new PublicKey(address);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = this.decodeBase58(signature);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
  }

  private decodeBase58(value: string): Uint8Array {
    try {
      return bs58.decode(value);
    } catch (error) {
      throw new Error('Invalid base58 signature');
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
    const timeout = Number(timeoutMs ?? this.configService.get('RPC_TIMEOUT_MS')) || 8000;
    let timeoutId: NodeJS.Timeout | undefined;
    const timer = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('RPC timeout')), timeout);
    });

    try {
      return await Promise.race([promise, timer]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
