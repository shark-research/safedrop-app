import {
  CanActivate,
  ExecutionContext,
  Injectable,
  TooManyRequestsException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRequestKey } from '../http/request-identity';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitEntry>();

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const windowMs =
      Number(this.configService.get('RATE_LIMIT_WINDOW_MS')) || 60000;
    const max = Number(this.configService.get('RATE_LIMIT_MAX')) || 30;
    const trustProxy = this.configService.get('TRUST_PROXY') === 'true';
    const key = getRequestKey(request, trustProxy);

    const entry = this.buckets.get(key);
    if (!entry || now > entry.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= max) {
      throw new TooManyRequestsException('Too many requests');
    }

    entry.count += 1;
    return true;
  }
}
