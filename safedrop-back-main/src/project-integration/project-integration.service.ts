import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchWithTimeout } from '../common/http/fetch-with-timeout';
import { FileLoggerService } from '../logger/file-logger.service';
import { ProjectIntegrationService as ProjectIntegrationContract } from '../verification/interfaces/project-integration.interface';
import { ChainType } from '../verification/interfaces/blockchain.interface';

@Injectable()
export class ProjectIntegrationService implements ProjectIntegrationContract {
  constructor(
    private readonly configService: ConfigService,
    private readonly fileLogger: FileLoggerService,
  ) {}

  async pushGrindVaultPair(input: {
    vaultAddress: string;
    grindAddress: string;
    projectId: string;
    chain: ChainType;
    linkedAt: string;
  }): Promise<void> {
    const url = this.configService.get<string>('PROJECT_INTEGRATION_URL');
    if (!url) {
      throw new Error('PROJECT_INTEGRATION_URL is not set');
    }

    const apiKey = this.configService.get<string>('PROJECT_INTEGRATION_API_KEY');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        vault_address: input.vaultAddress,
        grind_address: input.grindAddress,
        project_id: input.projectId,
        chain: input.chain,
        linked_at: input.linkedAt,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.fileLogger.error(`[PROJECT_INTEGRATION] push failed status=${response.status} body=${body}`);
      throw new Error(`Project integration failed with status ${response.status}`);
    }

    this.fileLogger.info('[PROJECT_INTEGRATION] push success');
  }
}
