import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationDto } from './dto/verification.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/verification')
@ApiTags('verification')
export class VerificationController {
  constructor(private readonly appService: VerificationService) {}

  @Post()
  verification(@Body(ValidationPipe) data: VerificationDto) {
    return this.appService.verification(data);
  }
}
