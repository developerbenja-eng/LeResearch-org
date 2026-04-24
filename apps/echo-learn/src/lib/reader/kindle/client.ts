/**
 * Send to Kindle - Client & OAuth2
 *
 * High-level client for sending files to Kindle devices via Amazon's
 * Send-to-Kindle HTTP API. Uses OAuth2 for authentication (no email needed).
 *
 * Usage:
 *   1. Create an OAuth2 instance and get the sign-in URL
 *   2. User authorizes in browser → redirect URL with auth code
 *   3. Create client from redirect URL → stores device credentials
 *   4. List devices, send files
 *
 * Ported from stkclient (MIT License)
 * https://github.com/maxdjohnson/stkclient
 */

import crypto from 'crypto';
import { Signer } from './signer';
import * as api from './api';
import type { DeviceInfo, OwnedDevice, SerializedClient } from './types';
import { OAUTH_CLIENT_ID } from './types';

// ============================================================================
// CLIENT
// ============================================================================

export class SendToKindleClient {
  private signer: Signer;
  private deviceInfo: DeviceInfo;

  constructor(deviceInfo: DeviceInfo) {
    this.deviceInfo = deviceInfo;
    this.signer = Signer.fromDeviceInfo(deviceInfo);
  }

  /**
   * Get a list of Kindle devices owned by the user.
   */
  async getOwnedDevices(): Promise<OwnedDevice[]> {
    const res = await api.getListOfOwnedDevices(this.signer);
    return res.ownedDevices;
  }

  /**
   * Send a file buffer to the specified Kindle devices.
   *
   * @param fileBuffer - The file content as a Buffer
   * @param targetDeviceSerialNumbers - Which devices to send to
   * @param options - Document metadata (author, title, format)
   * @returns SKU identifier assigned by Amazon
   */
  async sendFile(
    fileBuffer: Buffer,
    targetDeviceSerialNumbers: string[],
    options: { author: string; title: string; format: string },
  ): Promise<string> {
    // 1. Get a pre-signed upload URL
    const upload = await api.getUploadUrl(this.signer, fileBuffer.length);

    // 2. Upload the file
    await api.uploadFile(upload.uploadUrl, fileBuffer);

    // 3. Tell Amazon to deliver it to the devices
    const result = await api.sendToKindle(
      this.signer,
      upload.stkToken,
      targetDeviceSerialNumbers,
      options,
    );

    return result.sku;
  }

  /**
   * Deregister this device / logout.
   */
  async logout(): Promise<void> {
    await api.logout(this.signer);
  }

  /**
   * Serialize the client to a JSON string for persistent storage.
   * Store this securely (contains private key).
   */
  serialize(): string {
    const data: SerializedClient = {
      version: 1,
      device_info: this.deviceInfo,
    };
    return JSON.stringify(data);
  }

  /**
   * Deserialize a client from a JSON string.
   */
  static deserialize(json: string): SendToKindleClient {
    const data: SerializedClient = JSON.parse(json);
    if (data.version !== 1) {
      throw new Error('Invalid serialized client version');
    }
    return new SendToKindleClient(data.device_info);
  }
}

// ============================================================================
// OAUTH2
// ============================================================================

export class KindleOAuth2 {
  private verifier: string;

  constructor() {
    this.verifier = base64UrlEncode(crypto.randomBytes(32));
  }

  /**
   * Get the Amazon sign-in URL. Open this in a browser to start auth.
   *
   * @param returnTo - Custom return URL. Defaults to Amazon's Send-to-Kindle page.
   *   Set this to your own callback page to auto-capture the auth code.
   */
  getSignInUrl(returnTo?: string): string {
    const challenge = base64UrlEncode(sha256(Buffer.from(this.verifier, 'utf-8')));

    const params = new URLSearchParams({
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.ns.oa2': 'http://www.amazon.com/ap/ext/oauth/2',
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.oa2.client_id': `device:${OAUTH_CLIENT_ID}`,
      'openid.mode': 'checkid_setup',
      'openid.oa2.scope': 'device_auth_access',
      'openid.oa2.response_type': 'code',
      'openid.oa2.code_challenge': challenge,
      'openid.oa2.code_challenge_method': 'S256',
      'openid.return_to': returnTo ?? 'https://www.amazon.com/gp/sendtokindle',
      'openid.ns.pape': 'http://specs.openid.net/extensions/pape/1.0',
      'openid.pape.max_auth_age': '0',
      accountStatusPolicy: 'P1',
      'openid.assoc_handle': 'amzn_device_na',
      pageId: 'amzn_device_common_dark',
      disableLoginPrepopulate: '1',
    });

    return `https://www.amazon.com/ap/signin?${params.toString()}`;
  }

  /**
   * Get the code verifier (needed for the callback API route).
   */
  getVerifier(): string {
    return this.verifier;
  }

  /**
   * Create a client from the OAuth2 redirect URL.
   * Call this after the user completes Amazon sign-in.
   *
   * @param redirectUrl - The full URL the user was redirected to after sign-in
   */
  async createClient(redirectUrl: string): Promise<SendToKindleClient> {
    const code = parseAuthorizationCode(redirectUrl);
    const accessToken = await api.tokenExchange(code, this.verifier);
    const deviceInfo = await api.registerDeviceWithToken(accessToken);
    return new SendToKindleClient(deviceInfo);
  }

  /**
   * Create a client from an authorization code directly.
   * Use this when you already have the code (e.g., from a callback route).
   */
  async createClientFromCode(authorizationCode: string): Promise<SendToKindleClient> {
    const accessToken = await api.tokenExchange(authorizationCode, this.verifier);
    const deviceInfo = await api.registerDeviceWithToken(accessToken);
    return new SendToKindleClient(deviceInfo);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function parseAuthorizationCode(redirectUrl: string): string {
  const url = new URL(redirectUrl);
  const code = url.searchParams.get('openid.oa2.authorization_code');
  if (!code) {
    throw new Error('No authorization code found in redirect URL');
  }
  return code;
}

function base64UrlEncode(data: Buffer): string {
  return data.toString('base64url').replace(/=+$/, '');
}

function sha256(data: Buffer): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}
