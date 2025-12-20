import { ChainType } from './blockchain.interface';

export type GrindWalletRecord = Readonly<{
  grindAddress: string;
  vaultHash: string;
  projectId: string;
  chain: ChainType;
  linkedAt: string;
  messageHash: string;
}>;

export type DbClient = {
  query<T = unknown>(text: string, params?: ReadonlyArray<unknown>): Promise<{ rows: T[] }>;
};

export interface GrindWalletRepository {
  findGrindWallet(address: string, client?: DbClient): Promise<GrindWalletRecord | null>;
  createGrindWalletLink(record: GrindWalletRecord, client?: DbClient): Promise<void>;
  withTransaction<T>(work: (client: DbClient) => Promise<T>): Promise<T>;
}
