/**
 * Shared presentation-layer types for chip-transfer-related components.
 * Contains only type definitions — zero runtime code.
 */

/**
 * Translation function type for presentation components.
 * Compatible with i18next TFunction without importing from i18next.
 * Components use this instead of importing TFunction directly.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type TranslateFn = Function;

/**
 * Chip transfer operation status used by NfcScanModal and NfcTapPrompt.
 */
export type ChipTransferStatus =
  | 'idle'
  | 'scanning'
  | 'reading'
  | 'writing'
  | 'verifying'
  | 'success'
  | 'error';

/**
 * Chip transfer hardware capability status used by NfcCapabilityNotice.
 */
export type ChipTransferCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';
