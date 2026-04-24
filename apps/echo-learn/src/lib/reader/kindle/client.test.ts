import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { SendToKindleClient, KindleOAuth2 } from './client';
import type { DeviceInfo } from './types';
import { OAUTH_CLIENT_ID } from './types';

// Generate a test RSA key pair
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const TEST_DEVICE_INFO: DeviceInfo = {
  device_private_key: privateKey,
  adp_token: 'test-adp-token',
  device_type: 'A1K6D1WRW0MALS',
  given_name: 'Test',
  name: 'Test User',
  account_pool: 'Amazon',
  user_directed_id: 'test-uid',
  user_device_name: 'Test Kindle',
};

describe('SendToKindleClient', () => {
  describe('serialize / deserialize', () => {
    it('round-trips through JSON serialization', () => {
      const client = new SendToKindleClient(TEST_DEVICE_INFO);
      const json = client.serialize();
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.device_info.adp_token).toBe('test-adp-token');
      expect(parsed.device_info.device_private_key).toBe(privateKey);
      expect(parsed.device_info.given_name).toBe('Test');
    });

    it('deserializes back to a working client', () => {
      const original = new SendToKindleClient(TEST_DEVICE_INFO);
      const json = original.serialize();
      const restored = SendToKindleClient.deserialize(json);

      // The restored client should produce the same serialization
      expect(restored.serialize()).toBe(json);
    });

    it('rejects invalid version', () => {
      const invalidJson = JSON.stringify({ version: 99, device_info: TEST_DEVICE_INFO });
      expect(() => SendToKindleClient.deserialize(invalidJson)).toThrow(
        'Invalid serialized client version',
      );
    });

    it('rejects malformed JSON', () => {
      expect(() => SendToKindleClient.deserialize('not json')).toThrow();
    });
  });
});

describe('KindleOAuth2', () => {
  it('generates a sign-in URL pointing to Amazon', () => {
    const oauth = new KindleOAuth2();
    const url = oauth.getSignInUrl();

    expect(url).toMatch(/^https:\/\/www\.amazon\.com\/ap\/signin\?/);
  });

  it('includes the OAuth client ID in the sign-in URL', () => {
    const oauth = new KindleOAuth2();
    const url = oauth.getSignInUrl();

    // URLSearchParams encodes the colon as %3A
    expect(url).toContain(`device%3A${OAUTH_CLIENT_ID}`);
  });

  it('includes PKCE S256 challenge in the sign-in URL', () => {
    const oauth = new KindleOAuth2();
    const url = oauth.getSignInUrl();

    expect(url).toContain('openid.oa2.code_challenge=');
    expect(url).toContain('openid.oa2.code_challenge_method=S256');
  });

  it('exposes the verifier for the callback route', () => {
    const oauth = new KindleOAuth2();
    const verifier = oauth.getVerifier();

    expect(typeof verifier).toBe('string');
    expect(verifier.length).toBeGreaterThan(0);
    // Base64url encoded 32 bytes = ~43 chars
    expect(verifier.length).toBeGreaterThanOrEqual(40);
  });

  it('generates different verifiers for different instances', () => {
    const oauth1 = new KindleOAuth2();
    const oauth2 = new KindleOAuth2();

    expect(oauth1.getVerifier()).not.toBe(oauth2.getVerifier());
  });

  it('includes required OpenID parameters', () => {
    const oauth = new KindleOAuth2();
    const url = oauth.getSignInUrl();
    const parsed = new URL(url);

    expect(parsed.searchParams.get('openid.mode')).toBe('checkid_setup');
    expect(parsed.searchParams.get('openid.oa2.scope')).toBe('device_auth_access');
    expect(parsed.searchParams.get('openid.oa2.response_type')).toBe('code');
    expect(parsed.searchParams.get('openid.return_to')).toBe(
      'https://www.amazon.com/gp/sendtokindle',
    );
  });

  it('generates a valid S256 challenge from the verifier', () => {
    const oauth = new KindleOAuth2();
    const url = oauth.getSignInUrl();
    const verifier = oauth.getVerifier();

    // Manually compute the expected challenge
    const expectedChallenge = crypto
      .createHash('sha256')
      .update(Buffer.from(verifier, 'utf-8'))
      .digest('base64url')
      .replace(/=+$/, '');

    const parsed = new URL(url);
    const challenge = parsed.searchParams.get('openid.oa2.code_challenge');
    expect(challenge).toBe(expectedChallenge);
  });
});
