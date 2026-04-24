import jwt, { type SignOptions } from 'jsonwebtoken';

const DEFAULT_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface TokenOptions {
  secret: string;
  expiresIn?: SignOptions['expiresIn'];
}

export function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options: TokenOptions
): string {
  const expiresIn = options.expiresIn ?? DEFAULT_TOKEN_EXPIRY;
  return jwt.sign(payload, options.secret, { expiresIn });
}

export function verifyToken(
  token: string,
  secret: string
): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return authHeader;
}
