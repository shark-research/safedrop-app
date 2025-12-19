import {
  IsIn,
  IsNotEmpty,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export const SUPPORTED_EXCHANGES = [
  'binance',
  'bingx',
  'bitget',
  'bybit',
  'gate',
  'kraken',
  'kucoin',
  'mexc',
  'okx',
] as const;

const PASSPHRASE_REQUIRED = new Set(['okx', 'kucoin', 'bitget']);

function requiresPassphrase(exchange?: string): boolean {
  return Boolean(exchange && PASSPHRASE_REQUIRED.has(exchange));
}

@ValidatorConstraint({ name: 'PassphraseRequired', async: false })
class PassphraseRequiredConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as VerificationDto;
    if (requiresPassphrase(obj.exchange)) {
      return typeof value === 'string' && value.trim().length > 0;
    }

    if (value === null || value === undefined || value === '') {
      return true;
    }

    return typeof value === 'string';
  }

  defaultMessage(): string {
    return 'passphrase is required for okx, kucoin, and bitget';
  }
}

export class VerificationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsIn(SUPPORTED_EXCHANGES)
  @ApiProperty({
    description: 'exchange',
    example: 'binance',
    required: true,
    type: String,
  })
  exchange: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'key',
    example: 'key',
    required: true,
    type: String,
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'secret',
    example: 'secret',
    required: true,
    type: String,
  })
  secret: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'wallet',
    example: '0x...',
    required: true,
    type: String,
  })
  wallet: string;

  @Validate(PassphraseRequiredConstraint)
  @ApiProperty({
    description: 'passphrase (required for OKX, KuCoin, Bitget)',
    example: '123456',
    required: false,
    type: String,
  })
  passphrase?: string;
}
