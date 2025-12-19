import { createHmac, timingSafeEqual } from 'crypto';

export type JwtPayload = {
  sub: string;
  iat: number;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
};

type JwtVerifyOptions = {
  issuer?: string;
  audience?: string;
};

function base64UrlEncode(value: Buffer | string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64');
}

export function signJwt(payload: JwtPayload, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(data).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${data}.${encodedSignature}`;
}

export function verifyJwt(
  token: string,
  secret: string,
  options: JwtVerifyOptions = {},
): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(data)
    .digest();
  const expectedEncoded = base64UrlEncode(expectedSignature);

  const expectedBuffer = Buffer.from(expectedEncoded);
  const providedBuffer = Buffer.from(encodedSignature);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    throw new Error('Invalid signature');
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf-8')) as {
    alg?: string;
  };
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported token algorithm');
  }

  const payload = JSON.parse(
    base64UrlDecode(encodedPayload).toString('utf-8'),
  ) as JwtPayload;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp !== undefined && payload.exp !== null && now >= payload.exp) {
    throw new Error('Token expired');
  }

  if (options.issuer && payload.iss !== options.issuer) {
    throw new Error('Invalid issuer');
  }

  if (options.audience && payload.aud !== options.audience) {
    throw new Error('Invalid audience');
  }

  return payload;
}
