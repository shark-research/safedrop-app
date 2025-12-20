import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileLoggerModule } from '../logger/file-logger.module';
import { ProjectIntegrationService } from './project-integration.service';
import { PROJECT_INTEGRATION_SERVICE } from '../verification/verification.tokens';

@Module({
  imports: [ConfigModule, FileLoggerModule],
  providers: [
    {
      provide: PROJECT_INTEGRATION_SERVICE,
      useClass: ProjectIntegrationService,
    },
  ],
  exports: [PROJECT_INTEGRATION_SERVICE],
})
export class ProjectIntegrationModule {}
