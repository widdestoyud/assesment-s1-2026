const config = {
  dev: import.meta.env.DEV ?? false,
  basicVersion:
    process.env.VITE_BASIC_VERSION ?? import.meta.env.VITE_BASIC_VERSION,
  basePath: process.env.VITE_BASE_PATH ?? import.meta.env.VITE_BASE_PATH,
  /** When false, NFC capability check is bypassed (UI always shows as supported) */
  nfcCheckEnabled:
    (process.env.VITE_NFC_CHECK_ENABLED ?? import.meta.env.VITE_NFC_CHECK_ENABLED) === 'true',
  tanStack: {
    routeDevTool:
      process.env.VITE_ROUTE_DEVTOOL ?? import.meta.env.VITE_ROUTE_DEVTOOL,
  },

  // Balance constraints
  minTopUp: 2000,
  maxBalance: 300000,

  // Silent Shield (encryption)
  silentShield: {
    algorithm: 'AES-GCM',
    // Encryption key material — acceptable for offline-first app with no backend.
    // Card data protection is defense-in-depth against casual NFC readers.
    passphrase: 'mbc-silent-shield-v1', // NOSONAR: offline-first design, no backend for key management
    salt: 'mbc-cooperative-2024',
    iterations: 100000,
    keyLength: 32,
    ivLength: 12,
    tagLength: 16,
  },
} as const;

export default config;
