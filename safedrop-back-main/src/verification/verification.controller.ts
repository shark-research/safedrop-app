import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationDto } from './dto/verification.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { InternalNetworkGuard } from '../common/guards/internal-network.guard';
import { ConcurrencyGuard } from '../common/guards/concurrency.guard';
import { LinkGrindDto } from './dto/link-grind.dto';

@Controller('api/verification')
@UseGuards(ApiKeyGuard, InternalNetworkGuard, RateLimitGuard, ConcurrencyGuard)
@ApiTags('verification')
export class VerificationController {
  private readonly logger = new Logger(VerificationController.name);

  constructor(private readonly appService: VerificationService) { }

  @Post()
  verification(@Body() data: VerificationDto) {
    this.logger.log(`[INCOMING] POST /api/verification - exchange=${data.exchange}`);
    return this.appService.verification(data);
  }

  @Post('link-grind')
  linkGrind(@Body() data: LinkGrindDto) {
    this.logger.log(`[INCOMING] POST /api/verification/link-grind - chain=${data.chain}`);
    return this.appService.linkGrindWallet(data);
  }
}
