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
    return typeof window !== 'undefined' && 'NDEFReader' in window;
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
          } catch {
            onError({
              type: 'read_failed',
              message: 'Failed to extract data from NFC tag',
            });
          }
        };

        ndef.onreadingerror = () => {
          onError({
            type: 'read_failed',
            message: 'Error reading NFC tag — tag may be incompatible',
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
              });
              break;
            case 'NotSupportedError':
              onError({
                type: 'hardware_unavailable',
                message: 'NFC hardware is not available on this device',
              });
              break;
            default:
              onError({
                type: 'read_failed',
                message: `NFC scan failed: ${error.message}`,
              });
          }
        } else {
          onError({
            type: 'read_failed',
            message: 'An unexpected error occurred during NFC scan',
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
            );
          case 'NotSupportedError':
            throw createNfcError(
              'hardware_unavailable',
              'NFC hardware is not available on this device',
            );
          case 'NetworkError':
            throw createNfcError(
              'connection_lost',
              'NFC connection lost during write — tag may have been removed',
            );
          default:
            throw createNfcError(
              'write_failed',
              `NFC write failed: ${error.message}`,
            );
        }
      }
      throw createNfcError(
        'write_failed',
        'An unexpected error occurred during NFC write',
      );
    }
  },
};

/**
 * Extract the payload bytes from an NDEF message.
 * Expects a single text record containing base64-encoded data.
 */
function extractPayload(message: NDEFMessage): Uint8Array {
  for (const record of message.records) {
    if (record.recordType === 'text' && record.data) {
      const decoder = new TextDecoder();
      const base64 = decoder.decode(record.data);
      return base64ToUint8Array(base64);
    }
  }
  throw new Error('No text record found in NFC tag');
}

/** Convert Uint8Array to base64 string */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Convert base64 string to Uint8Array */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Helper to create a typed NfcError */
function createNfcError(type: NfcError['type'], message: string): NfcError {
  return { type, message };
}
