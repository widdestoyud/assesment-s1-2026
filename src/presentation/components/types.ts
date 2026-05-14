/**
 * Shared presentation-layer types for chip-transfer-related components.
 * Contains only type definitions — zero runtime code.
 */

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
