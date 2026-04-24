/**
 * Encryption utilities for sensitive data at rest
 *
 * Uses AES-256-GCM for authenticated encryption.
 * Requires ENCRYPTION_KEY environment variable (32 bytes, base64 encoded).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Key should be 32 bytes (256 bits), base64 encoded
 */
function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_KEY;

  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  const key = Buffer.from(keyBase64, 'base64');

  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits) when decoded');
  }

  return key;
}

/**
 * Check if encryption is configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt a string value
 * Returns: base64(iv + authTag + ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine: IV (12) + AuthTag (16) + Ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt an encrypted value
 * Input: base64(iv + authTag + ciphertext)
 */
export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, 'base64');

  // Extract parts
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Encrypt if encryption is configured, otherwise return as-is
 * Adds prefix to identify encrypted values
 */
export function encryptIfConfigured(value: string): string {
  if (!isEncryptionConfigured()) {
    console.warn('[Encryption] ENCRYPTION_KEY not set, storing value unencrypted');
    return value;
  }

  const encrypted = encrypt(value);
  return `enc:${encrypted}`;
}

/**
 * Decrypt if value is encrypted, otherwise return as-is
 */
export function decryptIfEncrypted(value: string): string {
  if (!value.startsWith('enc:')) {
    // Not encrypted (legacy value or encryption not configured)
    return value;
  }

  if (!isEncryptionConfigured()) {
    throw new Error('Cannot decrypt: ENCRYPTION_KEY not configured');
  }

  return decrypt(value.substring(4));
}

/**
 * Generate a new encryption key (for initial setup)
 * Run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('base64');
}
