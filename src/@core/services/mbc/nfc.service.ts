import type { AwilixRegistry } from '@di/container';
import type { NfcProtocol } from '@core/protocols/nfc';
import type {
  NfcError,
  NfcPermissionResult,
  NfcScanSession,
  WriteVerifyResult,
} from '@core/services/mbc/models';

export class NfcServiceError extends Error {
  readonly type: NfcError['type'];
  readonly messageKey: string;
  readonly messageParams?: Record<string, string | number>;

  constructor(nfcError: NfcError) {
    super(nfcError.messageKey);
    this.name = 'NfcServiceError';
    this.type = nfcError.type;
    this.messageKey = nfcError.messageKey;
    this.messageParams = nfcError.messageParams;
  }
}

export interface NfcServiceInterface {
  /** Check if NFC hardware is available */
  isAvailable(): boolean;
  /** Request NFC permission from the user */
  requestPermission(): Promise<NfcPermissionResult>;
  /** Read raw bytes from an NFC card (one-shot: resolves on first read) */
  readCard(): Promise<Uint8Array>;
  /** Write raw bytes to an NFC card */
  writeCard(data: Uint8Array): Promise<void>;
  /** Write data and verify by reading back */
  writeAndVerify(data: Uint8Array): Promise<WriteVerifyResult>;
}

export const NfcService = (
  deps: Pick<AwilixRegistry, 'nfcProtocol'>,
): NfcServiceInterface => {
  const { nfcProtocol }: { nfcProtocol: NfcProtocol } = deps;

  const isAvailable = (): boolean => {
    return nfcProtocol.isSupported();
  };

  const requestPermission = async (): Promise<NfcPermissionResult> => {
    return nfcProtocol.requestPermission();
  };

  const readCard = (): Promise<Uint8Array> => {
    return new Promise<Uint8Array>((resolve, reject) => {
      let session: NfcScanSession | null = null;

      const onRead = (data: Uint8Array): void => {
        session?.abort();
        resolve(data);
      };

      const onError = (err: NfcError): void => {
        session?.abort();
        reject(new NfcServiceError(err));
      };

      session = nfcProtocol.startScan(onRead, onError);
    });
  };

  const writeCard = async (data: Uint8Array): Promise<void> => {
    await nfcProtocol.write(data);
  };

  const writeAndVerify = async (
    data: Uint8Array,
  ): Promise<WriteVerifyResult> => {
    try {
      // Step 1: Write data to card
      await nfcProtocol.write(data);

      // Step 2: Read back for verification
      const readBack = await readCard();

      // Step 3: Compare written vs read
      if (!arraysEqual(data, readBack)) {
        return {
          success: false,
          error: 'mbc_error_write_verification_failed',
        };
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'mbc_error_write_verification_failed',
      };
    }
  };

  return { isAvailable, requestPermission, readCard, writeCard, writeAndVerify };
};

/** Compare two Uint8Arrays for byte-level equality */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
