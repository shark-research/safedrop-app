import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('VERIFICATION_API_KEY');
    if (!expected) {
      throw new InternalServerErrorException('VERIFICATION_API_KEY is not set');
    }

    const request = context.switchToHttp().getRequest();
    const header = request.headers['x-api-key'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
