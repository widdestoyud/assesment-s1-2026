import { Buffer } from 'buffer';
import { describe, expect, it, vi } from 'vitest';
import { decryptAuthHeader, encryptAuthHeader } from '../encrypt.helper';

// Mock config
vi.mock('@src/infrastructure/config', () => ({
  default: {
    encrypt: {
      algo: 'aes-128-ofb',
    },
    dev: false,
    nodeEnv: 'test-secret',
    signature: {
      clientId: 'test-client-id',
      secretKey: 'test-secret-key',
    },
  },
}));

vi.mock('crypto-browserify', async () => {
  const actual = await vi.importActual('crypto-browserify');
  return {
    ...actual,
    randomBytes: (length: number) => {
      if (length === 8) {
        return Buffer.from('1234abcd1234abcd');
      }
      return Buffer.from('1234abcd1234abcd1234abcd1234abcd');
    }, // 32 byte IV
    createCipheriv: () => ({
      update: (data: string) => `encrypted_${data}`,
      final: () => '',
    }),
    createDecipheriv: () => ({
      update: (data: string) => data.replace('encrypted_', ''),
      final: () => '',
    }),
    createHmac: () => ({
      update: () => ({
        digest: () =>
          '1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd',
      }),
    }),
    pbkdf2Sync: vi.fn().mockImplementation(() => Buffer.from('salt')),
    timingSafeEqual: (a: Buffer, b: Buffer) => a.toString() === b.toString(),
  };
});

vi.mock('buffer', async () => {
  const actual = await vi.importActual('buffer');
  return {
    ...actual,
    Buffer: {
      from: vi.fn(input => {
        if (input === 'invalid') {
          throw new Error();
        }
        return {
          toString: vi.fn(() => input),
        };
      }),
    },
  };
});

describe('Crypto Utilities', () => {
  describe('encryptAuthHeader and decryptAuthHeader', () => {
    it('should encrypt and decrypt auth header correctly', () => {
      const originalHeader = 'test-token-123';

      // Test encryption
      const encrypted = encryptAuthHeader(originalHeader);
      const iv = encrypted.substring(0, 16);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(originalHeader);
      expect(iv).toHaveLength(16);

      // Test decryption
      const decrypted = decryptAuthHeader(encrypted);
      expect(decrypted).toBe(originalHeader);
    });

    it('should handle different input lengths', () => {
      const testCases = [
        'Short',
        'Medium length token',
        'Very long token with special characters: !@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./',
      ];

      testCases.forEach(header => {
        const encrypted = encryptAuthHeader(header);
        const decrypted = decryptAuthHeader(encrypted);
        expect(decrypted).toBe(header);
      });
    });

    it('should throw error when decrypting invalid input', () => {
      expect(() => decryptAuthHeader('invalid')).toThrow();
    });
  });
});
