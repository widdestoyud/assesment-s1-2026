import type { NfcProtocol } from '@core/protocols/nfc';
import type {
  NfcError,
  NfcPermissionResult,
  NfcScanSession,
} from '@core/services/mbc/models';
import config from '@src/infrastructure/config';

const MBC_MIME_TYPE = 'application/octet-stream';

/**
 * Web NFC API adapter implementing NfcProtocol.
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
export const webNfcAdapter: NfcProtocol = {
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

  async requestPermission(): Promise<NfcPermissionResult> {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    // Guard: NDEFReader may not exist even when isSupported() returns true (nfcCheckEnabled=false on desktop)
    if (!('NDEFReader' in globalThis)) {
      return 'unsupported';
    }

    try {
      const ndef = new NDEFReader();
      const controller = new AbortController();
      await ndef.scan({ signal: controller.signal });
      controller.abort();
      return 'granted';
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        return 'denied';
      }
      return 'denied';
    }
  },

  startScan(
    onRead: (data: Uint8Array) => void,
    onError: (err: NfcError) => void,
  ): NfcScanSession {
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

        ndef.onreading = (event: NDEFReadingEvent) => {
          readSucceeded = true;
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

          if (readErrorTimeout) {
            clearTimeout(readErrorTimeout);
          }
          readErrorTimeout = setTimeout(() => {
            if (!readSucceeded) {
              onError({
                type: 'incompatible_card',
                message: 'Error reading NFC tag — tag may not be NDEF formatted.',
                messageKey: 'mbc_nfc_error_incompatible_card',
              });
            }
          }, 1000);
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
      throw createNfcError(
        'hardware_unavailable',
        'Web NFC is not supported on this device or browser',
        'mbc_nfc_error_hardware_unavailable',
      );
    }

    // Guard: NDEFReader may not exist even when isSupported() returns true (nfcCheckEnabled=false on desktop)
    if (!('NDEFReader' in globalThis)) {
      throw createNfcError(
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
          data: data,
        }],
      });
    } catch (error: unknown) {
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw createNfcError(
              'permission_denied',
              'NFC permission was denied by the user',
              'mbc_nfc_error_permission_denied',
            );
          case 'NotSupportedError':
            throw createNfcError(
              'hardware_unavailable',
              'NFC hardware is not available on this device',
              'mbc_nfc_error_hardware_unavailable',
            );
          case 'NetworkError':
            throw createNfcError(
              'connection_lost',
              'NFC connection lost during write — tag may have been removed',
              'mbc_nfc_error_connection_lost',
            );
          default:
            throw createNfcError(
              'write_failed',
              `NFC write failed: ${error.message}`,
              'mbc_nfc_error_write_failed',
            );
        }
      }
      throw createNfcError(
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
  for (const record of message.records) {
    // Priority 1: MIME record — direct binary (new format)
    if (record.recordType === 'mime' && record.data) {
      return new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);
    }
  }

  // Priority 2: Text record — legacy base64 format (backward compat)
  for (const record of message.records) {
    if (record.recordType === 'text' && record.data) {
      const decoder = new TextDecoder();
      const rawText = decoder.decode(record.data).trim();
      if (rawText.length > 0) {
        try {
          return base64ToUint8Array(rawText);
        } catch {
          // Try stripping language prefix
          for (const prefixLen of [2, 3, 5]) {
            if (rawText.length > prefixLen) {
              try {
                return base64ToUint8Array(rawText.substring(prefixLen));
              } catch {
                // Continue
              }
            }
          }
        }
      }
      return null;
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

/** Helper to create a typed NfcError with locale key */
function createNfcError(
  type: NfcError['type'],
  message: string,
  messageKey: string,
  messageParams?: Record<string, string | number>,
): NfcError {
  return { type, message, messageKey, ...(messageParams && { messageParams }) };
}
