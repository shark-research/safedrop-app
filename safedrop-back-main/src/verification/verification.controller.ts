import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationDto } from './dto/verification.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { InternalNetworkGuard } from '../common/guards/internal-network.guard';
import { ConcurrencyGuard } from '../common/guards/concurrency.guard';

@Controller('api/verification')
@UseGuards(ApiKeyGuard, InternalNetworkGuard, RateLimitGuard, ConcurrencyGuard)
@ApiTags('verification')
export class VerificationController {
  constructor(private readonly appService: VerificationService) {}

  @Post()
  verification(@Body() data: VerificationDto) {
    return this.appService.verification(data);
  }
}
