import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AwilixRegistry } from '@di/container';

import { SilentShieldService } from '../../mbc/silent-shield.service';

const mockContainer: AwilixRegistry = {} as AwilixRegistry;

describe('SilentShieldService', () => {
  let service: ReturnType<typeof SilentShieldService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = SilentShieldService(mockContainer);
  });

  describe('encrypt → decrypt round-trip', () => {
    it('decrypted data equals original data', async () => {
      const original = new TextEncoder().encode('Hello, World!');

      const encrypted = await service.encrypt(original);
      const decrypted = await service.decrypt(encrypted);

      expect(Array.from(decrypted)).toEqual(Array.from(original));
    });

    it('works with empty data', async () => {
      const original = new Uint8Array(0);

      const encrypted = await service.encrypt(original);
      const decrypted = await service.decrypt(encrypted);

      expect(Array.from(decrypted)).toEqual(Array.from(original));
    });

    it('works with large data', async () => {
      const original = new Uint8Array(1024).fill(42);

      const encrypted = await service.encrypt(original);
      const decrypted = await service.decrypt(encrypted);

      expect(Array.from(decrypted)).toEqual(Array.from(original));
    });
  });

  describe('encrypt', () => {
    it('produces different ciphertext each time (random IV)', async () => {
      const data = new TextEncoder().encode('test data');

      const encrypted1 = await service.encrypt(data);
      const encrypted2 = await service.encrypt(data);

      // Different IVs should produce different ciphertext
      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('throws mbc_error_encryption_failed when crypto.subtle.encrypt fails', async () => {
      const data = new TextEncoder().encode('test');

      // Create a fresh service and spy on crypto.subtle.encrypt to fail
      const freshService = SilentShieldService(mockContainer);

      // First call to encrypt will derive key successfully, then we break encrypt
      const originalEncrypt = crypto.subtle.encrypt.bind(crypto.subtle);
      const encryptSpy = vi.spyOn(crypto.subtle, 'encrypt').mockRejectedValue(new Error('Crypto failure'));

      await expect(freshService.encrypt(data)).rejects.toThrow('mbc_error_encryption_failed');

      encryptSpy.mockRestore();
    });

    it('re-throws mbc_error_key_derivation_failed when key derivation fails', async () => {
      const data = new TextEncoder().encode('test');

      // Mock importKey to fail (which triggers key derivation failure)
      const importKeySpy = vi.spyOn(crypto.subtle, 'importKey').mockRejectedValue(new Error('import failed'));

      const freshService = SilentShieldService(mockContainer);
      await expect(freshService.encrypt(data)).rejects.toThrow('mbc_error_key_derivation_failed');

      importKeySpy.mockRestore();
    });
  });

  describe('decrypt', () => {
    it('throws mbc_error_decryption_failed when data is corrupted', async () => {
      // Random garbage data that can't be decrypted
      const garbage = new Uint8Array(50).fill(0);

      await expect(service.decrypt(garbage)).rejects.toThrow('mbc_error_decryption_failed');
    });

    it('throws mbc_error_decryption_failed when IV is wrong', async () => {
      const data = new TextEncoder().encode('test');
      const encrypted = await service.encrypt(data);

      // Corrupt the IV (first 12 bytes)
      const corrupted = new Uint8Array(encrypted);
      corrupted[0] = corrupted[0] ^ 0xFF;
      corrupted[1] = corrupted[1] ^ 0xFF;

      await expect(service.decrypt(corrupted)).rejects.toThrow('mbc_error_decryption_failed');
    });

    it('re-throws mbc_error_key_derivation_failed when key derivation fails', async () => {
      const data = new Uint8Array(50);

      const importKeySpy = vi.spyOn(crypto.subtle, 'importKey').mockRejectedValue(new Error('import failed'));

      const freshService = SilentShieldService(mockContainer);
      await expect(freshService.decrypt(data)).rejects.toThrow('mbc_error_key_derivation_failed');

      importKeySpy.mockRestore();
    });
  });
});
