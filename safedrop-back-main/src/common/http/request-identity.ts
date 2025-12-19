import { isIP } from 'net';

function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) {
    const mapped = ip.slice(7);
    if (isIP(mapped) === 4) {
      return mapped;
    }
  }

  return ip;
}

export function getClientIp(request: any, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded = request.headers?.['x-forwarded-for'];
    const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof header === 'string' && header.length > 0) {
      return normalizeIp(header.split(',')[0].trim());
    }
  }

  const raw = request.ip || request.socket?.remoteAddress || 'unknown';
  return normalizeIp(raw);
}

export function getRequestKey(request: any, trustProxy: boolean): string {
  const ip = getClientIp(request, trustProxy);
  const userId = request.user?.sub || request.user?.id;
  return userId ? `${userId}:${ip}` : ip;
}
