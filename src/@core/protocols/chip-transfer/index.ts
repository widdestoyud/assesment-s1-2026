import type { ChipTransferError, ChipTransferScanSession, ChipTransferCapabilityStatus } from '@src/@core/models/mbc';

export interface ChipTransferProtocol {
  /** Check if chip transfer hardware is supported */
  isSupported(): boolean;

  /** Query the current permission state for chip transfer access */
  queryPermission(onChange?: (status: ChipTransferCapabilityStatus) => void): Promise<ChipTransferCapabilityStatus>;

  /** Start scanning for chip media. Returns a session with abort controller to stop. */
  startScan(
    onRead: (data: Uint8Array) => void,
    onError: (err: ChipTransferError) => void,
  ): ChipTransferScanSession;

  /** Write data to the next detected chip media */
  write(data: Uint8Array): Promise<void>;
}
