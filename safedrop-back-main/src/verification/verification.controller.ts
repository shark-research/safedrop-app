import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationDto } from './dto/verification.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('api/verification')
@UseGuards(ApiKeyGuard, RateLimitGuard)
@ApiTags('verification')
export class VerificationController {
  constructor(private readonly appService: VerificationService) {}

  @Post()
  verification(@Body(ValidationPipe) data: VerificationDto) {
    return this.appService.verification(data);
  }
}
