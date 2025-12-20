import { ChainType } from './blockchain.interface';

export interface ProjectIntegrationService {
  pushGrindVaultPair(input: {
    vaultAddress: string;
    grindAddress: string;
    projectId: string;
    chain: ChainType;
    linkedAt: string;
  }): Promise<void>;
}
