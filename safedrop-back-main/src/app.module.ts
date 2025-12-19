import { Module } from '@nestjs/common';
import { VerificationModule } from './verification/verification.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, VerificationModule],
})
export class AppModule {}
