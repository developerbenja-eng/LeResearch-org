import { createHash, randomBytes } from 'node:crypto';

/** SHA-256 hex digest — used for token_hash columns. Not for passwords. */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** URL-safe opaque token (base64url, no padding). Default 32 bytes = ~43 chars. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addDaysIso(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function addHoursIso(hours: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setUTCHours(d.getUTCHours() + hours);
  return d.toISOString();
}

export function isExpired(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}
