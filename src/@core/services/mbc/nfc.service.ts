import type { AwilixRegistry } from '@di/container';
import type { NfcProtocol } from '@core/protocols/nfc';
import type {
  NfcError,
  NfcScanSession,
} from '@src/@core/models/mbc';

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
  /** Read raw bytes from an NFC card (one-shot: resolves on first read) */
  readCard(): Promise<Uint8Array>;
  /** Read card, process data, then write back — all in one tap */
  readThenWrite(processor: (data: Uint8Array) => Promise<Uint8Array>): Promise<Uint8Array>;
}

export const NfcService = (
  deps: Pick<AwilixRegistry, 'nfcProtocol'>,
): NfcServiceInterface => {
  const { nfcProtocol }: { nfcProtocol: NfcProtocol } = deps;

  const isAvailable = (): boolean => {
    return nfcProtocol.isSupported();
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

  /**
   * Read card data, process it via callback, then write result back — all in one tap.
   * The processor receives raw encrypted bytes and must return new encrypted bytes to write.
   */
  const readThenWrite = (processor: (data: Uint8Array) => Promise<Uint8Array>): Promise<Uint8Array> => {
    return new Promise<Uint8Array>((resolve, reject) => {
      let session: NfcScanSession | null = null;

      const onRead = async (data: Uint8Array): Promise<void> => {
        try {
          const newData = await processor(data);
          await nfcProtocol.write(newData);
          session?.abort();
          resolve(data);
        } catch (err: unknown) {
          session?.abort();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };

      const onError = (err: NfcError): void => {
        session?.abort();
        reject(new NfcServiceError(err));
      };

      session = nfcProtocol.startScan(
        (data) => { onRead(data); },
        onError,
      );
    });
  };

  return { isAvailable, readCard, readThenWrite };
};
