import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const CHAINS = ['evm', 'solana'] as const;

export class LinkGrindDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '0x...', description: 'Grind wallet address' })
  grindAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '0x...', description: 'Vault wallet address' })
  vaultAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'project_123', description: 'Project ID' })
  projectId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsIn(CHAINS)
  @ApiProperty({ example: 'evm', description: 'Chain: evm | solana' })
  chain: 'evm' | 'solana';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'sig', description: 'Vault signature' })
  vaultSignature: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'sig', description: 'Grind signature' })
  grindSignature: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'nonce', description: 'Nonce for signature replay protection' })
  nonce: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2025-12-19T12:00:00Z', description: 'ISO timestamp' })
  timestamp: string;
}
