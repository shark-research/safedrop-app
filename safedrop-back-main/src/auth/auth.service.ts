import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { scryptSync, timingSafeEqual } from 'crypto';
import { signJwt } from './jwt';

type AuthUser = {
  username: string;
  salt?: string;
  hash?: string;
  password?: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  login(username: string, password: string) {
    const users = this.getUsers();
    const user = users.find((item) => item.username === username);
    if (!user || !this.verifyPassword(user, password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueToken(user.username);
  }

  private getUsers(): AuthUser[] {
    const raw = this.configService.get<string>('AUTH_USERS');
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser[];
      if (!Array.isArray(parsed)) {
        throw new Error('AUTH_USERS must be an array');
      }
      return parsed;
    } catch (error) {
      throw new InternalServerErrorException('Invalid AUTH_USERS format');
    }
  }

  private verifyPassword(user: AuthUser, password: string): boolean {
    if (user.hash && user.salt) {
      const salt = Buffer.from(user.salt, 'hex');
      const expected = Buffer.from(user.hash, 'hex');
      const derived = scryptSync(password, salt, expected.length);
      return (
        expected.length === derived.length &&
        timingSafeEqual(expected, derived)
      );
    }

    if (user.password) {
      const expected = Buffer.from(user.password);
      const provided = Buffer.from(password);
      return (
        expected.length === provided.length &&
        timingSafeEqual(expected, provided)
      );
    }

    return false;
  }

  private issueToken(username: string) {
    const secret = this.configService.get<string>('AUTH_JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('AUTH_JWT_SECRET is not set');
    }

    const ttl =
      Number(this.configService.get('AUTH_JWT_TTL_SECONDS')) || 3600;
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      sub: username,
      iat: now,
      exp: now + ttl,
      iss: this.configService.get('AUTH_JWT_ISSUER'),
      aud: this.configService.get('AUTH_JWT_AUDIENCE'),
    };

    const token = signJwt(payload, secret);
    return { accessToken: token, expiresIn: ttl };
  }
}
