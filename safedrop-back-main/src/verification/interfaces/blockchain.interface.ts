export type ChainType = 'evm' | 'solana';

export type TransactionRef = Readonly<{
  hash: string;
}>;

export type BalanceResult = Readonly<{
  amount: bigint;
  unit: 'wei' | 'lamports';
}>;

export interface BlockchainService {
  getTransactionHistory(
    address: string,
    chain: ChainType,
    opts?: { limit?: number; timeoutMs?: number },
  ): Promise<ReadonlyArray<TransactionRef>>;
  getBalance(
    address: string,
    chain: ChainType,
    opts?: { timeoutMs?: number },
  ): Promise<BalanceResult>;
  verifySig(input: {
    address: string;
    chain: ChainType;
    message: string;
    signature: string;
  }): Promise<boolean>;
}
