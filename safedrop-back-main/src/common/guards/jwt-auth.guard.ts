import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyJwt } from '../../auth/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['authorization'];
    if (!header || typeof header != 'string') {
      throw new UnauthorizedException('Missing authorization');
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization');
    }

    const secret = this.configService.get<string>('AUTH_JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('AUTH_JWT_SECRET is not set');
    }

    try {
      const payload = verifyJwt(token, secret, {
        issuer: this.configService.get('AUTH_JWT_ISSUER'),
        audience: this.configService.get('AUTH_JWT_AUDIENCE'),
      });

      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
