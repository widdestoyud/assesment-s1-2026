import type { NfcProtocol } from '@core/protocols/nfc';
import type {
  NfcError,
  NfcPermissionResult,
  NfcScanSession,
} from '@core/services/mbc/models';

/**
 * Web NFC API adapter implementing NfcProtocol.
 *
 * Wraps the browser's NDEFReader API behind a clean interface.
 * Card data is stored as a single NDEF text record containing
 * the encrypted+serialized payload as a base64 string.
 *
 * Browser support: Chrome Android 89+.
 * Requires HTTPS context and user gesture for first scan.
 */
export const webNfcAdapter: NfcProtocol = {
  isSupported(): boolean {
    return typeof globalThis.window !== 'undefined' && 'NDEFReader' in globalThis;
  },

  async requestPermission(): Promise<NfcPermissionResult> {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    try {
      // Triggering a scan is the only way to request NFC permission
      // in the Web NFC API. We start and immediately abort.
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

    const ndef = new NDEFReader();

    ndef
      .scan({ signal: controller.signal })
      .then(() => {
        ndef.onreading = (event: NDEFReadingEvent) => {
          try {
            const data = extractPayload(event.message);
            onRead(data);
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('No text record')) {
              onError({
                type: 'blank_card',
                message: 'This card is blank — no text record found',
                messageKey: 'mbc_nfc_error_blank_card',
              });
            } else {
              onError({
                type: 'invalid_card_data',
                message: 'Card data is not recognized as valid MBC data',
                messageKey: 'mbc_nfc_error_card_not_recognized',
              });
            }
          }
        };

        ndef.onreadingerror = () => {
          onError({
            type: 'incompatible_card',
            message: 'Error reading NFC tag — tag may be incompatible',
            messageKey: 'mbc_nfc_error_incompatible_card',
          });
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

    try {
      const ndef = new NDEFReader();
      // Encode as base64 text record to fit within NDEF text record constraints
      const base64 = uint8ArrayToBase64(data);
      await ndef.write({
        records: [{ recordType: 'text', data: base64 }],
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
 * Extract the payload bytes from an NDEF message.
 * Expects a single text record containing base64-encoded data.
 *
 * Throws distinguishable errors:
 * - "No text record found in NFC tag" when no text record exists (blank card)
 * - "Failed to decode base64 data from NFC tag" when base64 decoding fails (non-MBC data)
 */
function extractPayload(message: NDEFMessage): Uint8Array {
  for (const record of message.records) {
    if (record.recordType === 'text' && record.data) {
      const decoder = new TextDecoder();
      const base64 = decoder.decode(record.data);
      try {
        return base64ToUint8Array(base64);
      } catch {
        throw new Error('Failed to decode base64 data from NFC tag');
      }
    }
  }
  throw new Error('No text record found in NFC tag');
}

/** Convert Uint8Array to base64 string */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return btoa(binary);
}

/** Convert base64 string to Uint8Array */
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
