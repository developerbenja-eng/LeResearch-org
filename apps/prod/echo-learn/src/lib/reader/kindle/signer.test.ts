import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { Signer } from './signer';

// Generate a test RSA key pair for signing tests
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const TEST_ADP_TOKEN = 'test-adp-token-123';

describe('Signer', () => {
  it('creates a Signer from PEM key and adp token', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    expect(signer.adpToken).toBe(TEST_ADP_TOKEN);
  });

  it('creates a Signer from DeviceInfo', () => {
    const signer = Signer.fromDeviceInfo({
      device_private_key: privateKey,
      adp_token: TEST_ADP_TOKEN,
      device_type: 'test',
      given_name: 'Test',
      name: 'Test User',
      account_pool: 'Amazon',
      user_directed_id: 'test-id',
      user_device_name: 'Test Device',
    });
    expect(signer.adpToken).toBe(TEST_ADP_TOKEN);
  });

  it('generates a digest header in the format base64:date', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const digest = signer.digestHeaderForRequest('POST', '/test', '{"data":true}');

    // Format: base64_signature:ISO8601_date
    const parts = digest.split(':');
    // The base64 part may contain colons inside the date portion
    // Format is actually: base64:YYYY-MM-DDTHH:MM:SSZ
    // So we need to split differently
    expect(digest).toMatch(/^[A-Za-z0-9+/=]+:\d{4}-\d{2}-\d{2}T/);
  });

  it('produces deterministic output for the same date', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-01-15T12:00:00Z';

    const digest1 = signer.digestHeaderForRequest('GET', '/path', '', fixedDate);
    const digest2 = signer.digestHeaderForRequest('GET', '/path', '', fixedDate);

    expect(digest1).toBe(digest2);
  });

  it('produces different output for different methods', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-01-15T12:00:00Z';

    const digestGet = signer.digestHeaderForRequest('GET', '/path', '', fixedDate);
    const digestPost = signer.digestHeaderForRequest('POST', '/path', '', fixedDate);

    // Extract just the signature part (before the date)
    const sigGet = digestGet.substring(0, digestGet.indexOf(':2025'));
    const sigPost = digestPost.substring(0, digestPost.indexOf(':2025'));

    expect(sigGet).not.toBe(sigPost);
  });

  it('produces different output for different paths', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-01-15T12:00:00Z';

    const digest1 = signer.digestHeaderForRequest('POST', '/path1', '{}', fixedDate);
    const digest2 = signer.digestHeaderForRequest('POST', '/path2', '{}', fixedDate);

    const sig1 = digest1.substring(0, digest1.indexOf(':2025'));
    const sig2 = digest2.substring(0, digest2.indexOf(':2025'));

    expect(sig1).not.toBe(sig2);
  });

  it('produces different output for different body content', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-01-15T12:00:00Z';

    const digest1 = signer.digestHeaderForRequest('POST', '/path', '{"a":1}', fixedDate);
    const digest2 = signer.digestHeaderForRequest('POST', '/path', '{"b":2}', fixedDate);

    const sig1 = digest1.substring(0, digest1.indexOf(':2025'));
    const sig2 = digest2.substring(0, digest2.indexOf(':2025'));

    expect(sig1).not.toBe(sig2);
  });

  it('signature is valid base64', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-01-15T12:00:00Z';
    const digest = signer.digestHeaderForRequest('POST', '/test', '{}', fixedDate);

    // Extract base64 part (everything before :YYYY-)
    const sig = digest.substring(0, digest.indexOf(':2025'));

    // Should be valid base64 — decodes without error
    const decoded = Buffer.from(sig, 'base64');
    // RSA 2048 produces 256-byte signatures
    expect(decoded.length).toBe(256);
  });

  it('includes the signing date in the header', () => {
    const signer = new Signer(privateKey, TEST_ADP_TOKEN);
    const fixedDate = '2025-06-15T08:30:00Z';
    const digest = signer.digestHeaderForRequest('GET', '/', '', fixedDate);

    expect(digest).toContain(fixedDate);
  });
});
