import type { AwilixRegistry } from '@di/container';
import type { ChipTransferProtocol } from '@core/protocols/chip-transfer';
import type {
  ChipTransferCapabilityStatus,
  ChipTransferError,
  ChipTransferScanSession,
} from '@src/@core/models/mbc';

export class ChipTransferServiceError extends Error {
  readonly type: ChipTransferError['type'];
  readonly messageKey: string;
  readonly messageParams?: Record<string, string | number>;

  constructor(chipTransferError: ChipTransferError) {
    super(chipTransferError.messageKey);
    this.name = 'ChipTransferServiceError';
    this.type = chipTransferError.type;
    this.messageKey = chipTransferError.messageKey;
    this.messageParams = chipTransferError.messageParams;
  }
}

export interface ChipTransferServiceInterface {
  /** Check if chip transfer hardware is available */
  isAvailable(): boolean;
  /** Query the current permission state, optionally listen for changes */
  queryPermission(onChange?: (status: ChipTransferCapabilityStatus) => void): Promise<ChipTransferCapabilityStatus>;
  /** Read raw bytes from a chip card (one-shot: resolves on first read) */
  readCard(): Promise<Uint8Array>;
  /** Read card, process data, then write back — all in one tap */
  readThenWrite(processor: (data: Uint8Array) => Promise<Uint8Array>): Promise<Uint8Array>;
}

export const ChipTransferService = (
  deps: Pick<AwilixRegistry, 'chipTransferProtocol'>,
): ChipTransferServiceInterface => {
  const { chipTransferProtocol }: { chipTransferProtocol: ChipTransferProtocol } = deps;

  const isAvailable = (): boolean => {
    return chipTransferProtocol.isSupported();
  };

  const queryPermission = (onChange?: (status: ChipTransferCapabilityStatus) => void): Promise<ChipTransferCapabilityStatus> => {
    return chipTransferProtocol.queryPermission(onChange);
  };

  const readCard = (): Promise<Uint8Array> => {
    return new Promise<Uint8Array>((resolve, reject) => {
      let session: ChipTransferScanSession | null = null;

      const onRead = (data: Uint8Array): void => {
        session?.abort();
        resolve(data);
      };

      const onError = (err: ChipTransferError): void => {
        session?.abort();
        reject(new ChipTransferServiceError(err));
      };

      session = chipTransferProtocol.startScan(onRead, onError);
    });
  };

  /**
   * Read card data, process it via callback, then write result back — all in one tap.
   * The processor receives raw encrypted bytes and must return new encrypted bytes to write.
   */
  const readThenWrite = (processor: (data: Uint8Array) => Promise<Uint8Array>): Promise<Uint8Array> => {
    return new Promise<Uint8Array>((resolve, reject) => {
      let session: ChipTransferScanSession | null = null;

      const onRead = async (data: Uint8Array): Promise<void> => {
        try {
          const newData = await processor(data);
          await chipTransferProtocol.write(newData);
          session?.abort();
          resolve(data);
        } catch (err: unknown) {
          session?.abort();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };

      const onError = (err: ChipTransferError): void => {
        session?.abort();
        reject(new ChipTransferServiceError(err));
      };

      session = chipTransferProtocol.startScan(
        (data) => { onRead(data); },
        onError,
      );
    });
  };

  return { isAvailable, queryPermission, readCard, readThenWrite };
};
