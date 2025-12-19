import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { ConcurrencyGuard } from '../common/guards/concurrency.guard';
import { VerificationService } from './verification.service';
import { VerificationDto } from './dto/verification.dto';

@Controller('api/public/verification')
@UseGuards(JwtAuthGuard, RateLimitGuard, ConcurrencyGuard)
@ApiBearerAuth()
@ApiTags('verification')
export class PublicVerificationController {
  private readonly logger = new Logger(PublicVerificationController.name);

  constructor(private readonly appService: VerificationService) { }

  @Post()
  verification(@Body() data: VerificationDto) {
    this.logger.log(`[INCOMING] POST /api/public/verification - exchange=${data.exchange}`);
    return this.appService.verification(data);
  }
}
