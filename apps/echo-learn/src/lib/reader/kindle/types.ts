/**
 * Send to Kindle - TypeScript Types
 *
 * Ported from stkclient (MIT License)
 * https://github.com/maxdjohnson/stkclient
 */

// ============================================================================
// DEVICE & AUTH
// ============================================================================

export interface DeviceInfo {
  device_private_key: string;
  adp_token: string;
  device_type: string;
  given_name: string;
  name: string;
  account_pool: string;
  user_directed_id: string;
  user_device_name: string;
  home_region?: string;
}

export interface SerializedClient {
  version: 1;
  device_info: DeviceInfo;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface OwnedDevice {
  deviceCapabilities: Record<string, boolean>;
  deviceName: string;
  deviceSerialNumber: string;
}

export interface GetOwnedDevicesResponse {
  ownedDevices: OwnedDevice[];
  statusCode: number;
}

export interface GetUploadUrlResponse {
  expiryTime: number;
  statusCode: number;
  stkToken: string;
  uploadUrl: string;
}

export interface SendToKindleResponse {
  sku: string;
  statusCode: number;
}

// ============================================================================
// CLIENT INFO
// ============================================================================

export const DEFAULT_CLIENT_INFO = {
  appName: 'ShellExtension',
  appVersion: '1.1.1.253',
  os: 'MacOSX_10.14.6_x64',
  osArchitecture: 'x64',
} as const;

export const DEVICE_REGISTRATION_PARAMS = {
  device_type: 'A1K6D1WRW0MALS',
  device_serial_number: 'ZYSQ37GQ5JQDAIKDZ3WYH6I74MJCVEGG',
  pid: 'D21NN3GG',
  software_version: '253',
  os_version: 'MacOSX_10.14.6_x64',
  device_model: 'Echo Home Reader',
} as const;

export const OAUTH_CLIENT_ID = '658490dfb190e494030082836775981fa23be0c2425441860352ba0f55915b43002d';
