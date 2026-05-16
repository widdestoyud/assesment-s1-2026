import type { AwilixRegistry } from '@di/container';

import config from '@src/infrastructure/config';

export interface SilentShieldServiceInterface {
  encrypt(data: Uint8Array): Promise<Uint8Array>;
  decrypt(data: Uint8Array): Promise<Uint8Array>;
}

export const SilentShieldService = (
  _deps: AwilixRegistry,
): SilentShieldServiceInterface => {
  // Cache the derived CryptoKey to avoid expensive PBKDF2 on every call
  let cachedKey: CryptoKey | null = null;
  let keyDerivationPromise: Promise<CryptoKey> | null = null;

  const deriveKey = async (): Promise<CryptoKey> => {
    if (cachedKey) return cachedKey;
    if (keyDerivationPromise) return keyDerivationPromise;

    keyDerivationPromise = (async () => {
      try {
        const encoder = new TextEncoder();

        // Step 1: Import passphrase as raw key material
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          encoder.encode(config.silentShield.passphrase),
          'PBKDF2',
          false,
          ['deriveKey'],
        );

        // Step 2: Derive AES-256 key using PBKDF2
        const derivedKey = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: encoder.encode(config.silentShield.salt),
            iterations: config.silentShield.iterations,
            hash: 'SHA-256',
          },
          keyMaterial,
          {
            name: config.silentShield.algorithm,
            length: config.silentShield.keyLength * 8,
          },
          false,
          ['encrypt', 'decrypt'],
        );

        cachedKey = derivedKey;
        return derivedKey;
      } catch {
        throw new Error('mbc_error_key_derivation_failed');
      }
    })();

    return keyDerivationPromise;
  };

  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    try {
      const key = await deriveKey();
      const iv = crypto.getRandomValues(
        new Uint8Array(config.silentShield.ivLength),
      );

      // Web Crypto API returns [ciphertext | authTag] combined
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: config.silentShield.algorithm,
          iv,
          tagLength: config.silentShield.tagLength * 8,
        },
        key,
        data as unknown as BufferSource,
      );

      // Output format: [IV (12B) | ciphertext | authTag (16B)]
      const encrypted = new Uint8Array(encryptedBuffer);
      const result = new Uint8Array(iv.length + encrypted.length);
      result.set(iv, 0);
      result.set(encrypted, iv.length);

      return result;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'mbc_error_key_derivation_failed') {
        throw error;
      }
      throw new Error('mbc_error_encryption_failed');
    }
  };

  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    try {
      const key = await deriveKey();

      const ivLength = config.silentShield.ivLength;
      const iv = data.subarray(0, ivLength);
      // Web Crypto expects [ciphertext | authTag] as a single buffer
      const combined = data.subarray(ivLength);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: config.silentShield.algorithm,
          iv: iv as unknown as BufferSource,
          tagLength: config.silentShield.tagLength * 8,
        },
        key,
        combined as unknown as BufferSource,
      );

      return new Uint8Array(decryptedBuffer);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'mbc_error_key_derivation_failed') {
        throw error;
      }
      throw new Error('mbc_error_decryption_failed');
    }
  };

  return { encrypt, decrypt };
};
