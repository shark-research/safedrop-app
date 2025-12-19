import {
  CanActivate,
  ExecutionContext,
  Injectable,
  TooManyRequestsException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRequestKey } from '../http/request-identity';

@Injectable()
export class ConcurrencyGuard implements CanActivate {
  private readonly inflight = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const max =
      Number(this.configService.get('MAX_CONCURRENT_REQUESTS')) || 3;
    const trustProxy = this.configService.get('TRUST_PROXY') === 'true';
    const key = getRequestKey(request, trustProxy);

    const current = this.inflight.get(key) || 0;
    if (current >= max) {
      throw new TooManyRequestsException('Too many concurrent requests');
    }

    this.inflight.set(key, current + 1);

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      const next = (this.inflight.get(key) || 1) - 1;
      if (next <= 0) {
        this.inflight.delete(key);
      } else {
        this.inflight.set(key, next);
      }
    };

    response.on('finish', cleanup);
    response.on('close', cleanup);

    return true;
  }
}
