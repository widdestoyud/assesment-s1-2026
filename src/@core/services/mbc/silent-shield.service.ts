import type { AwilixRegistry } from '@di/container';

import { MBC_KEYS } from '@utils/constants/mbc-keys';

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
          encoder.encode(MBC_KEYS.SILENT_SHIELD_PASSPHRASE),
          'PBKDF2',
          false,
          ['deriveKey'],
        );

        // Step 2: Derive AES-256 key using PBKDF2
        const derivedKey = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: encoder.encode(MBC_KEYS.SILENT_SHIELD_SALT),
            iterations: MBC_KEYS.SILENT_SHIELD_ITERATIONS,
            hash: 'SHA-256',
          },
          keyMaterial,
          {
            name: MBC_KEYS.SILENT_SHIELD_ALGORITHM,
            length: MBC_KEYS.SILENT_SHIELD_KEY_LENGTH * 8,
          },
          false,
          ['encrypt', 'decrypt'],
        );

        cachedKey = derivedKey;
        return derivedKey;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Key derivation failed: ${message}`);
      }
    })();

    return keyDerivationPromise;
  };

  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    try {
      const key = await deriveKey();
      const iv = crypto.getRandomValues(
        new Uint8Array(MBC_KEYS.SILENT_SHIELD_IV_LENGTH),
      );

      // Web Crypto API returns [ciphertext | authTag] combined
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: MBC_KEYS.SILENT_SHIELD_ALGORITHM,
          iv,
          tagLength: MBC_KEYS.SILENT_SHIELD_TAG_LENGTH * 8,
        },
        key,
        data,
      );

      // Output format: [IV (12B) | ciphertext | authTag (16B)]
      const encrypted = new Uint8Array(encryptedBuffer);
      const result = new Uint8Array(iv.length + encrypted.length);
      result.set(iv, 0);
      result.set(encrypted, iv.length);

      return result;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith('Key derivation failed:')) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Encryption failed: ${message}`);
    }
  };

  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    try {
      const key = await deriveKey();

      const ivLength = MBC_KEYS.SILENT_SHIELD_IV_LENGTH;
      const iv = data.subarray(0, ivLength);
      // Web Crypto expects [ciphertext | authTag] as a single buffer
      const combined = data.subarray(ivLength);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: MBC_KEYS.SILENT_SHIELD_ALGORITHM,
          iv,
          tagLength: MBC_KEYS.SILENT_SHIELD_TAG_LENGTH * 8,
        },
        key,
        combined,
      );

      return new Uint8Array(decryptedBuffer);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith('Key derivation failed:')) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Decryption failed: ${message}`);
    }
  };

  return { encrypt, decrypt };
};
