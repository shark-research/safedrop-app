import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isIP } from 'net';
import { getClientIp } from '../http/request-identity';

const DEFAULT_ALLOWLIST = [
  '127.0.0.1/32',
  '::1/128',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
];

type ParsedCidr = {
  version: 4 | 6;
  base: bigint;
  mask: number;
};

function ipToBigInt(ip: string): { version: 4 | 6; value: bigint } | null {
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;

    let value = 0n;
    for (const part of parts) {
      const num = Number(part);
      if (!Number.isInteger(num) || num < 0 || num > 255) return null;
      value = (value << 8n) + BigInt(num);
    }

    return { version: 4, value };
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized.indexOf('::') !== normalized.lastIndexOf('::')) {
      return null;
    }

    const parts = normalized.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    if (left.length + right.length > 8) return null;

    const missing = 8 - (left.length + right.length);
    const groups = [...left, ...Array(missing).fill('0'), ...right];
    if (groups.length !== 8) return null;

    let value = 0n;
    for (const group of groups) {
      const chunk = group || '0';
      const num = Number.parseInt(chunk, 16);
      if (!Number.isInteger(num) || num < 0 || num > 0xffff) return null;
      value = (value << 16n) + BigInt(num);
    }

    return { version: 6, value };
  }

  return null;
}

function parseCidr(input: string): ParsedCidr | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('/');
  if (parts.length > 2) return null;

  const ipInfo = ipToBigInt(parts[0]);
  if (!ipInfo) return null;

  const bits = ipInfo.version === 4 ? 32 : 128;
  let mask = bits;
  if (parts.length === 2) {
    mask = Number(parts[1]);
    if (!Number.isInteger(mask) || mask < 0 || mask > bits) {
      return null;
    }
  }

  return { version: ipInfo.version, base: ipInfo.value, mask };
}

function buildAllowlist(raw: string | undefined): ParsedCidr[] {
  const cidrs = (raw ? raw.split(',') : DEFAULT_ALLOWLIST)
    .map(parseCidr)
    .filter(Boolean);

  if (cidrs.length > 0) {
    return cidrs as ParsedCidr[];
  }

  return DEFAULT_ALLOWLIST.map(parseCidr).filter(Boolean) as ParsedCidr[];
}

function isIpAllowed(ip: string, allowlist: ParsedCidr[]): boolean {
  const ipInfo = ipToBigInt(ip);
  if (!ipInfo) return false;

  const totalBits = ipInfo.version === 4 ? 32 : 128;
  for (const cidr of allowlist) {
    if (cidr.version !== ipInfo.version) continue;
    const shift = BigInt(totalBits - cidr.mask);
    const ipPrefix = ipInfo.value >> shift;
    const basePrefix = cidr.base >> shift;
    if (ipPrefix === basePrefix) return true;
  }

  return false;
}

@Injectable()
export class InternalNetworkGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const trustProxy = this.configService.get('TRUST_PROXY') === 'true';
    const ip = getClientIp(request, trustProxy);
    const allowlist = buildAllowlist(
      this.configService.get('INTERNAL_NETWORK_CIDRS'),
    );

    if (!isIpAllowed(ip, allowlist)) {
      throw new ForbiddenException('Internal access only');
    }

    return true;
  }
}
