import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'username',
    example: 'user',
    required: true,
    type: String,
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'password',
    example: 'password',
    required: true,
    type: String,
  })
  password: string;
}
