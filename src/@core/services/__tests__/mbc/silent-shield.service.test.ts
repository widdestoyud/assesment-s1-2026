import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AwilixRegistry } from '@di/container';

import { SilentShieldService } from '../../mbc/silent-shield.service';

const mockContainer: AwilixRegistry = {} as AwilixRegistry;

describe('SilentShieldService', () => {
  let service: ReturnType<typeof SilentShieldService>;

  beforeEach(() => {
    service = SilentShieldService(mockContainer);
  });

  describe('Property 1: Encryption Round-Trip', () => {
    it(
      'decrypt(encrypt(data)) ≡ data for all valid byte arrays',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uint8Array({ minLength: 1, maxLength: 512 }),
            async (data) => {
              const encrypted = await service.encrypt(data);
              const decrypted = await service.decrypt(encrypted);
              expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(data));
            },
          ),
          { numRuns: 100 },
        );
      },
      60000,
    );
  });

  describe('Property 2: Non-Deterministic Encryption (IV Uniqueness)', () => {
    it(
      'encrypting the same data twice produces different ciphertext',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uint8Array({ minLength: 1, maxLength: 128 }),
            async (data) => {
              const encrypted1 = await service.encrypt(data);
              const encrypted2 = await service.encrypt(data);
              // Different due to random IV
              expect(encrypted1).not.toEqual(encrypted2);
            },
          ),
          { numRuns: 100 },
        );
      },
      60000,
    );
  });

  describe('Property 3: Output Length Invariant', () => {
    it(
      'encrypted output length === data.length + 28 (12B IV + 16B authTag)',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uint8Array({ minLength: 1, maxLength: 512 }),
            async (data) => {
              const encrypted = await service.encrypt(data);
              expect(encrypted.length).toBe(data.length + 28);
            },
          ),
          { numRuns: 100 },
        );
      },
      60000,
    );
  });

  describe('Key Caching', () => {
    it('reuses the same key across multiple operations', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);

      // First call derives the key
      const encrypted1 = await service.encrypt(data);
      // Second call should reuse cached key
      const encrypted2 = await service.encrypt(data);

      // Both should decrypt correctly (proves same key was used)
      const decrypted1 = await service.decrypt(encrypted1);
      const decrypted2 = await service.decrypt(encrypted2);
      expect(new Uint8Array(decrypted1)).toEqual(data);
      expect(new Uint8Array(decrypted2)).toEqual(data);
    });
  });

  describe('Error Handling', () => {
    it('throws descriptive error when decrypting corrupt data', async () => {
      const corruptData = new Uint8Array(50);
      crypto.getRandomValues(corruptData);

      await expect(service.decrypt(corruptData)).rejects.toThrow(
        'Decryption failed:',
      );
    });

    it('throws descriptive error when decrypting data too short', async () => {
      // Less than 28 bytes (12 IV + 16 authTag minimum)
      const shortData = new Uint8Array(10);

      await expect(service.decrypt(shortData)).rejects.toThrow(
        'Decryption failed:',
      );
    });
  });
});
