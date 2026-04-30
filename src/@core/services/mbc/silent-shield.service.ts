import type { AwilixRegistry } from '@di/container';

import crypto from 'crypto-browserify';

import { MBC_KEYS } from '@utils/constants/mbc-keys';

export interface SilentShieldServiceInterface {
  encrypt(data: Uint8Array): Uint8Array;
  decrypt(data: Uint8Array): Uint8Array;
}

export const SilentShieldService = (
  _deps: AwilixRegistry,
): SilentShieldServiceInterface => {
  // Cache the derived key to avoid expensive PBKDF2 on every call
  let cachedKey: Buffer | null = null;

  const deriveKey = (): Buffer => {
    if (cachedKey) return cachedKey;
    cachedKey = crypto.pbkdf2Sync(
      MBC_KEYS.SILENT_SHIELD_PASSPHRASE,
      MBC_KEYS.SILENT_SHIELD_SALT,
      MBC_KEYS.SILENT_SHIELD_ITERATIONS,
      MBC_KEYS.SILENT_SHIELD_KEY_LENGTH,
      'sha256',
    );
    return cachedKey;
  };

  const encrypt = (data: Uint8Array): Uint8Array => {
    const key = deriveKey();
    const iv = crypto.randomBytes(MBC_KEYS.SILENT_SHIELD_IV_LENGTH);
    const cipher = crypto.createCipheriv(
      MBC_KEYS.SILENT_SHIELD_ALGORITHM,
      key,
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(data)),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Output format: [IV (12B) | ciphertext | authTag (16B)]
    const result = Buffer.concat([iv, encrypted, authTag]);
    return new Uint8Array(result);
  };

  const decrypt = (data: Uint8Array): Uint8Array => {
    const key = deriveKey();
    const buf = Buffer.from(data);

    const ivLength = MBC_KEYS.SILENT_SHIELD_IV_LENGTH;
    const tagLength = MBC_KEYS.SILENT_SHIELD_TAG_LENGTH;

    const iv = buf.subarray(0, ivLength);
    const authTag = buf.subarray(buf.length - tagLength);
    const ciphertext = buf.subarray(ivLength, buf.length - tagLength);

    const decipher = crypto.createDecipheriv(
      MBC_KEYS.SILENT_SHIELD_ALGORITHM,
      key,
      iv,
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return new Uint8Array(decrypted);
  };

  return { encrypt, decrypt };
};
