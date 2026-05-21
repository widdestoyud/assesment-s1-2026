import type { ChipTransferProtocol } from '@core/protocols/chip-transfer';
import type {
  ChipTransferError,
  ChipTransferScanSession,
  ChipTransferCapabilityStatus,
} from '@src/@core/models/mbc';
import config from '@src/infrastructure/config';

const MBC_MIME_TYPE = 'application/octet-stream';

/**
 * Web NFC API adapter implementing ChipTransferProtocol.
 *
 * Wraps the browser's NDEFReader API behind a clean interface.
 * Card data is stored as a single NDEF MIME record (application/octet-stream)
 * containing raw binary encrypted bytes — no base64 encoding overhead.
 *
 * This maximizes usable storage on NTAG215 (~466 bytes for payload after
 * NDEF headers and AES-GCM overhead).
 *
 * Browser support: Chrome Android 89+.
 * Requires HTTPS context and user gesture for first scan.
 */
export const webNfcAdapter: ChipTransferProtocol = {
  isSupported(): boolean {
    // When NFC check is disabled, always report as supported (for UI development)
    if (!config.nfcCheckEnabled) return true;
    if (typeof globalThis.window === 'undefined') return false;
    if (!('NDEFReader' in globalThis)) return false;
    // Web NFC is only reliably supported in Chrome Android 89+
    const ua = navigator.userAgent;
    const isChrome = /Chrome\/\d+/.test(ua) && !/SamsungBrowser|EdgA|OPR/.test(ua);
    return isChrome;
  },

  async queryPermission(onChange?: (status: ChipTransferCapabilityStatus) => void): Promise<ChipTransferCapabilityStatus> {
    if (!this.isSupported()) return 'unsupported';

    // Use Permissions API to query NFC permission state
    if (!('permissions' in navigator)) return 'permission_pending';

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'nfc' as PermissionName });

      const mapState = (state: PermissionState): ChipTransferCapabilityStatus => {
        switch (state) {
          case 'granted': return 'supported';
          case 'denied': return 'permission_denied';
          default: return 'permission_pending';
        }
      };

      // Listen for permission changes if callback provided
      if (onChange) {
        permissionStatus.addEventListener('change', () => {
          onChange(mapState(permissionStatus.state));
        });
      }

      return mapState(permissionStatus.state);
    } catch {
      // Permissions API doesn't support 'nfc' query — fallback to pending
      return 'permission_pending';
    }
  },

  startScan(
    onRead: (data: Uint8Array) => void,
    onError: (err: ChipTransferError) => void,
  ): ChipTransferScanSession {
    const controller = new AbortController();

    if (!this.isSupported()) {
      onError({
        type: 'hardware_unavailable',
        message: 'Web NFC is not supported on this device or browser',
        messageKey: 'mbc_nfc_error_hardware_unavailable',
      });
      return { abort: () => controller.abort() };
    }

    // Guard: NDEFReader may not exist even when isSupported() returns true (nfcCheckEnabled=false on desktop)
    if (!('NDEFReader' in globalThis)) {
      onError({
        type: 'hardware_unavailable',
        message: 'NDEFReader API is not available in this browser. Use a Chrome Android device with NFC.',
        messageKey: 'mbc_nfc_error_hardware_unavailable',
      });
      return { abort: () => controller.abort() };
    }

    const ndef = new NDEFReader();

    ndef
      .scan({ signal: controller.signal })
      .then(() => {
        let readSucceeded = false;
        let readErrorTimeout: ReturnType<typeof setTimeout> | null = null;
        let errorCount = 0;
        const scanStartTime = Date.now();
        const GRACE_PERIOD_MS = 2000; // Ignore errors in first 2s (phantom reads)
        const ERROR_THRESHOLD = 2; // Require 2 consecutive errors before reporting
        const ERROR_DEBOUNCE_MS = 3000; // Wait 3s after last error before reporting

        ndef.onreading = (event: NDEFReadingEvent) => {
          readSucceeded = true;
          errorCount = 0; // Reset error count on successful read
          if (readErrorTimeout) {
            clearTimeout(readErrorTimeout);
            readErrorTimeout = null;
          }

          const data = extractPayload(event.message);
          if (data) {
            onRead(data);
          } else {
            // No recognizable record — treat as blank card
            onRead(new Uint8Array(0));
          }
        };

        ndef.onreadingerror = () => {
          if (readSucceeded) return;

          // Ignore errors during grace period (phantom reads from nearby tags)
          if (Date.now() - scanStartTime < GRACE_PERIOD_MS) return;

          errorCount++;

          if (readErrorTimeout) {
            clearTimeout(readErrorTimeout);
          }

          // Only report error after threshold consecutive errors
          if (errorCount >= ERROR_THRESHOLD) {
            readErrorTimeout = setTimeout(() => {
              if (!readSucceeded) {
                onError({
                  type: 'incompatible_card',
                  message: 'Error reading NFC tag — tag may not be NDEF formatted.',
                  messageKey: 'mbc_nfc_error_incompatible_card',
                });
              }
            }, ERROR_DEBOUNCE_MS);
          }
        };
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
              onError({
                type: 'permission_denied',
                message: 'NFC permission was denied by the user',
                messageKey: 'mbc_nfc_error_permission_denied',
              });
              break;
            case 'NotSupportedError':
              onError({
                type: 'hardware_unavailable',
                message: 'NFC hardware is not available on this device',
                messageKey: 'mbc_nfc_error_hardware_unavailable',
              });
              break;
            default:
              onError({
                type: 'read_failed',
                message: `NFC scan failed: ${error.message}`,
                messageKey: 'mbc_nfc_error_scan_failed',
              });
          }
        } else {
          onError({
            type: 'read_failed',
            message: 'An unexpected error occurred during NFC scan',
            messageKey: 'mbc_nfc_error_scan_failed',
          });
        }
      });

    return {
      abort: () => controller.abort(),
    };
  },

  async write(data: Uint8Array): Promise<void> {
    if (!this.isSupported()) {
      throw createChipTransferError(
        'hardware_unavailable',
        'Web NFC is not supported on this device or browser',
        'mbc_nfc_error_hardware_unavailable',
      );
    }

    // Guard: NDEFReader may not exist even when isSupported() returns true (nfcCheckEnabled=false on desktop)
    if (!('NDEFReader' in globalThis)) {
      throw createChipTransferError(
        'hardware_unavailable',
        'NDEFReader API is not available in this browser. Use a Chrome Android device with NFC.',
        'mbc_nfc_error_hardware_unavailable',
      );
    }

    const ndef = new NDEFReader();

    try {
      await ndef.write({
        records: [{
          recordType: 'mime',
          mediaType: MBC_MIME_TYPE,
          data: data.buffer as ArrayBuffer,
        }],
      });
    } catch (error: unknown) {
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw createChipTransferError(
              'permission_denied',
              'NFC permission was denied by the user',
              'mbc_nfc_error_permission_denied',
            );
          case 'NotSupportedError':
            throw createChipTransferError(
              'hardware_unavailable',
              'NFC hardware is not available on this device',
              'mbc_nfc_error_hardware_unavailable',
            );
          case 'NetworkError':
            throw createChipTransferError(
              'connection_lost',
              'NFC connection lost during write — tag may have been removed',
              'mbc_nfc_error_connection_lost',
            );
          default:
            throw createChipTransferError(
              'write_failed',
              `NFC write failed: ${error.message}`,
              'mbc_nfc_error_write_failed',
            );
        }
      }
      throw createChipTransferError(
        'write_failed',
        'An unexpected error occurred during NFC write',
        'mbc_nfc_error_write_failed',
      );
    }
  },
};

/**
 * Extract binary payload from an NDEF message.
 *
 * Supports two record formats for backward compatibility:
 * 1. MIME record (application/octet-stream) — new format, raw binary
 * 2. Text record — legacy format, base64-encoded binary
 *
 * Returns null if no recognizable record is found (blank card).
 */
function extractPayload(message: NDEFMessage): Uint8Array | null {
  return extractMimePayload(message) ?? extractTextPayload(message);
}

/** Priority 1: Extract raw binary from MIME record (new format) */
function extractMimePayload(message: NDEFMessage): Uint8Array | null {
  for (const record of message.records) {
    if (record.recordType === 'mime' && record.data) {
      return new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);
    }
  }
  return null;
}

/** Priority 2: Extract base64-encoded binary from Text record (legacy format) */
function extractTextPayload(message: NDEFMessage): Uint8Array | null {
  for (const record of message.records) {
    if (record.recordType === 'text' && record.data) {
      const decoder = new TextDecoder();
      const rawText = decoder.decode(record.data).trim();
      if (rawText.length > 0) {
        return decodeBase64WithFallback(rawText);
      }
      return null;
    }
  }
  return null;
}

/** Try decoding base64, with fallback for language-prefix stripping */
function decodeBase64WithFallback(rawText: string): Uint8Array | null {
  try {
    return base64ToUint8Array(rawText);
  } catch {
    // Try stripping language prefix (2, 3, or 5 bytes)
    for (const prefixLen of [2, 3, 5]) {
      if (rawText.length > prefixLen) {
        try {
          return base64ToUint8Array(rawText.substring(prefixLen));
        } catch {
          // Continue to next prefix length
        }
      }
    }
  }
  return null;
}

/** Convert base64 string to Uint8Array (legacy support) */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }
  return bytes;
}

/** Helper to create a typed ChipTransferError with locale key */
function createChipTransferError(
  type: ChipTransferError['type'],
  message: string,
  messageKey: string,
  messageParams?: Record<string, string | number>,
): ChipTransferError {
  return { type, message, messageKey, ...(messageParams && { messageParams }) };
}
