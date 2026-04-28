/**
 * Send to Kindle - RSA Request Signing
 *
 * Implements Amazon's custom request signing for the STK API.
 * Each request requires an X-ADP-Request-Digest header computed by:
 *   1. Concatenating method, path, date, body, and adp_token
 *   2. SHA-256 hashing the result
 *   3. RSA-encrypting with custom PKCS#1 v1.5 padding
 *   4. Base64-encoding the result
 *
 * Ported from stkclient (MIT License)
 * https://github.com/maxdjohnson/stkclient
 */

import crypto from 'crypto';
import type { DeviceInfo } from './types';

// PKCS#1 v1.5 padding prefix: 0x00 0x01 [0xFF bytes] 0x00
// The leading 0x00 is required by Node's privateEncrypt (RSA_NO_PADDING
// expects input to be exactly key-size bytes). The Python rsa library
// uses integer math where leading zeros are implicit.
const PKCS1_PADDING_HEX =
  '0001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00';

export class Signer {
  private privateKey: crypto.KeyObject;
  readonly adpToken: string;

  constructor(pemKey: string, adpToken: string) {
    this.privateKey = crypto.createPrivateKey({
      key: pemKey,
      format: 'pem',
    });
    this.adpToken = adpToken;
  }

  static fromDeviceInfo(info: DeviceInfo): Signer {
    return new Signer(info.device_private_key, info.adp_token);
  }

  /**
   * Compute the X-ADP-Request-Digest header value for a request.
   */
  digestHeaderForRequest(method: string, path: string, postData: string, signingDate?: string): string {
    const date = signingDate ?? getSigningDate();
    const sigData = [method, path, date, postData, this.adpToken].join('\n');
    const digest = sha256(Buffer.from(sigData, 'utf-8'));

    // Manual PKCS#1 v1.5 padding + raw RSA encryption
    const padding = Buffer.from(PKCS1_PADDING_HEX, 'hex');
    const padded = Buffer.concat([padding, digest]);

    // Use raw RSA private key encryption (sign with no additional padding)
    const encrypted = crypto.privateEncrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_NO_PADDING,
      },
      padded,
    );

    const b64 = encrypted.toString('base64');
    return `${b64}:${date}`;
  }
}

function getSigningDate(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function sha256(data: Buffer): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}
