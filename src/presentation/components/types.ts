/**
 * Shared presentation-layer types for NFC-related components.
 * Contains only type definitions — zero runtime code.
 */

/**
 * NFC operation status used by NfcScanModal and NfcTapPrompt.
 */
export type NfcStatus =
  | 'idle'
  | 'scanning'
  | 'reading'
  | 'writing'
  | 'verifying'
  | 'success'
  | 'error';

/**
 * NFC hardware capability status used by NfcCapabilityNotice.
 */
export type NfcCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';
