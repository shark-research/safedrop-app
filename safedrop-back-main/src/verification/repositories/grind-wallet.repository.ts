import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { FileLoggerService } from '../../logger/file-logger.service';
import { PG_POOL } from '../../database/postgres.tokens';
import {
  DbClient,
  GrindWalletRecord,
  GrindWalletRepository as GrindWalletRepositoryContract,
} from '../interfaces/grind-wallet-repository.interface';

const TABLE = 'grind_wallet_links';

@Injectable()
export class GrindWalletRepository implements GrindWalletRepositoryContract {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly fileLogger: FileLoggerService,
  ) {}

  async findGrindWallet(address: string, client?: DbClient): Promise<GrindWalletRecord | null> {
    const runner = client ?? this.pool;
    const result = await runner.query<GrindWalletRecord>(
      `SELECT grind_address AS "grindAddress",
              vault_hash AS "vaultHash",
              project_id AS "projectId",
              chain,
              linked_at AS "linkedAt",
              message_hash AS "messageHash"
         FROM ${TABLE}
        WHERE grind_address = $1
        LIMIT 1`,
      [address],
    );

    return result.rows[0] ?? null;
  }

  async createGrindWalletLink(record: GrindWalletRecord, client?: DbClient): Promise<void> {
    const runner = client ?? this.pool;
    await runner.query(
      `INSERT INTO ${TABLE}
        (grind_address, vault_hash, project_id, chain, linked_at, message_hash)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        record.grindAddress,
        record.vaultHash,
        record.projectId,
        record.chain,
        record.linkedAt,
        record.messageHash,
      ],
    );
    const masked =
      record.grindAddress.length > 10
        ? `${record.grindAddress.slice(0, 6)}...${record.grindAddress.slice(-4)}`
        : record.grindAddress;
    this.fileLogger.info(`[DB] grind link inserted ${masked}`);
  }

  async withTransaction<T>(work: (client: DbClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
