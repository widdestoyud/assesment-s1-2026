import type { ChipTransferError, ChipTransferScanSession } from '@src/@core/models/mbc';

export interface ChipTransferProtocol {
  /** Check if chip transfer hardware is supported and permission granted */
  isSupported(): boolean;

  /** Start scanning for chip media. Returns a session with abort controller to stop. */
  startScan(
    onRead: (data: Uint8Array) => void,
    onError: (err: ChipTransferError) => void,
  ): ChipTransferScanSession;

  /** Write data to the next detected chip media */
  write(data: Uint8Array): Promise<void>;
}
