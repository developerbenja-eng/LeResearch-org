/**
 * Send to Kindle - API Functions
 *
 * Typed wrapper functions for Amazon's auth and STK APIs.
 *
 * Endpoints:
 *   - api.amazon.com/auth/token — OAuth2 token exchange
 *   - firs-ta-g7g.amazon.com/FirsProxy/registerDeviceWithToken — device registration
 *   - stkservice.amazon.com/GetListOfOwnedDevices — list Kindle devices
 *   - stkservice.amazon.com/GetUploadUrl — get pre-signed upload URL
 *   - stkservice.amazon.com/SendToKindle — deliver file to device
 *
 * Ported from stkclient (MIT License)
 * https://github.com/maxdjohnson/stkclient
 */

import { Signer } from './signer';
import {
  DEFAULT_CLIENT_INFO,
  DEVICE_REGISTRATION_PARAMS,
  OAUTH_CLIENT_ID,
  type DeviceInfo,
  type GetOwnedDevicesResponse,
  type GetUploadUrlResponse,
  type SendToKindleResponse,
} from './types';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class STKAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string,
  ) {
    super(message);
    this.name = 'STKAPIError';
  }
}

// ============================================================================
// OAUTH / AUTH
// ============================================================================

/**
 * Exchange an authorization code for an access token.
 */
export async function tokenExchange(authorizationCode: string, codeVerifier: string): Promise<string> {
  const body = {
    app_name: 'Unknown',
    client_domain: 'DeviceLegacy',
    client_id: OAUTH_CLIENT_ID,
    code_algorithm: 'SHA-256',
    code_verifier: codeVerifier,
    requested_token_type: 'access_token',
    source_token: authorizationCode,
    source_token_type: 'authorization_code',
  };

  const res = await fetch('https://api.amazon.com/auth/token', {
    method: 'POST',
    headers: {
      'Accept-Language': 'en-US',
      'x-amzn-identity-auth-domain': 'api.amazon.com',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new STKAPIError(`Token exchange failed: ${res.status}`, res.status, text);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Register a long-lived device using an access token.
 * Returns DeviceInfo with credentials for authenticated API calls.
 */
export async function registerDeviceWithToken(accessToken: string): Promise<DeviceInfo> {
  const p = DEVICE_REGISTRATION_PARAMS;
  const xmlBody = `<?xml version='1.0' encoding='UTF-8'?><request><parameters><deviceType>${p.device_type}</deviceType><deviceSerialNumber>${p.device_serial_number}</deviceSerialNumber><pid>${p.pid}</pid><authToken>${accessToken}</authToken><authTokenType>AccessToken</authTokenType><softwareVersion>${p.software_version}</softwareVersion><os_version>${p.os_version}</os_version><device_model>${p.device_model}</device_model></parameters></request>`;

  const res = await fetch('https://firs-ta-g7g.amazon.com/FirsProxy/registerDeviceWithToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      Expect: '',
      'Accept-Language': 'en-US,*',
      'User-Agent': 'Mozilla/5.0',
    },
    body: xmlBody,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new STKAPIError(`Device registration failed: ${res.status}`, res.status, text);
  }

  const xml = await res.text();
  return parseDeviceInfoXml(xml);
}

// ============================================================================
// STK API (authenticated)
// ============================================================================

/**
 * Get list of Kindle devices owned by the user.
 */
export async function getListOfOwnedDevices(signer: Signer): Promise<GetOwnedDevicesResponse> {
  return stkRequest<GetOwnedDevicesResponse>('/GetListOfOwnedDevices', signer, {});
}

/**
 * Get a pre-signed URL for uploading a file.
 */
export async function getUploadUrl(signer: Signer, fileSize: number): Promise<GetUploadUrlResponse> {
  return stkRequest<GetUploadUrlResponse>('/GetUploadUrl', signer, { fileSize });
}

/**
 * Upload a file buffer to the pre-signed URL.
 */
export async function uploadFile(url: string, fileBuffer: Buffer): Promise<void> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,*',
      'Content-Length': String(fileBuffer.length),
      'User-Agent': 'Mozilla/5.0',
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new STKAPIError(`File upload failed: ${res.status}`, res.status, text);
  }
}

/**
 * Send an uploaded file to the specified Kindle devices.
 */
export async function sendToKindle(
  signer: Signer,
  stkToken: string,
  targetDeviceSerialNumbers: string[],
  options: { author: string; title: string; format: string },
): Promise<SendToKindleResponse> {
  return stkRequest<SendToKindleResponse>('/SendToKindle', signer, {
    DocumentMetadata: {
      author: options.author,
      crc32: 0,
      inputFormat: options.format,
      title: options.title,
    },
    archive: true,
    deliveryMechanism: 'WIFI',
    outputFormat: 'MOBI',
    stkToken,
    targetDevices: targetDeviceSerialNumbers,
  });
}

/**
 * Logout / deregister the device.
 */
export async function logout(signer: Signer): Promise<void> {
  const path = '/FirsProxy/disownFiona?contentDeleted=false';
  const res = await fetch('https://firs-ta-g7g.amazon.com' + path, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/xml',
      'X-ADP-Request-Digest': signer.digestHeaderForRequest('GET', path, ''),
      'X-ADP-Authentication-Token': signer.adpToken,
      'Accept-Language': 'en-US,*',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new STKAPIError(`Logout failed: ${res.status}`, res.status, text);
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

async function stkRequest<T>(path: string, signer: Signer, body: Record<string, unknown>): Promise<T> {
  const data = JSON.stringify({ ClientInfo: DEFAULT_CLIENT_INFO, ...body }, null, 4);

  const res = await fetch('https://stkservice.amazon.com' + path, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      'X-ADP-Request-Digest': signer.digestHeaderForRequest('POST', path, data),
      'X-ADP-Authentication-Token': signer.adpToken,
      'Accept-Language': 'en-US,*',
      'User-Agent': 'Mozilla/5.0',
    },
    body: data,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new STKAPIError(`STK API error at ${path}: ${res.status}`, res.status, text);
  }

  return res.json() as Promise<T>;
}

/**
 * Parse DeviceInfo from Amazon's XML registration response.
 * The XML is a flat structure: <response><tag>value</tag>...</response>
 */
function parseDeviceInfoXml(xml: string): DeviceInfo {
  const get = (tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return match?.[1] ?? '';
  };

  return {
    device_private_key: get('device_private_key'),
    adp_token: get('adp_token'),
    device_type: get('device_type'),
    given_name: get('given_name'),
    name: get('name'),
    account_pool: get('account_pool'),
    user_directed_id: get('user_directed_id'),
    user_device_name: get('user_device_name'),
    home_region: get('home_region') || undefined,
  };
}
