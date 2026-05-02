export const MBC_KEYS = {
  // Storage keys
  MBC_DEVICE_ID: 'mbc-device-id',
  MBC_SERVICE_REGISTRY: 'mbc-benefit-registry',

  // Storage config
  MBC_STORE_NAME: 'mbc-config',

  // Silent Shield config
  SILENT_SHIELD_ALGORITHM: 'AES-GCM',
  // Encryption key material — acceptable for offline-first app with no backend.
  // Card data protection is defense-in-depth against casual NFC readers.
  SILENT_SHIELD_PASSPHRASE: 'mbc-silent-shield-v1', // NOSONAR: offline-first design, no backend for key management
  SILENT_SHIELD_SALT: 'mbc-cooperative-2024',
  SILENT_SHIELD_ITERATIONS: 100000,
  SILENT_SHIELD_KEY_LENGTH: 32,
  SILENT_SHIELD_IV_LENGTH: 12,
  SILENT_SHIELD_TAG_LENGTH: 16,
} as const;

export type MbcKey = (typeof MBC_KEYS)[keyof typeof MBC_KEYS];
