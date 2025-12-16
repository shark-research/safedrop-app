import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationDto {
  @IsString()
  @ApiProperty({
    description: 'exchange',
    example: 'binance',
    required: true,
    type: String,
  })
  exchange: string;

  @IsString()
  @ApiProperty({
    description: 'key',
    example: 'key',
    required: true,
    type: String,
  })
  key: string;

  @IsString()
  @ApiProperty({
    description: 'secret',
    example: 'secret',
    required: true,
    type: String,
  })
  secret: string;

  @IsString()
  @ApiProperty({
    description: 'wallet',
    example: '0x...',
    required: true,
    type: String,
  })
  wallet: string;

  @IsString()
  @ApiProperty({
    description: 'passphrase',
    example: '123456',
    required: true,
    type: String,
  })
  passphrase: string;
}
