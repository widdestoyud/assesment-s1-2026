import type { NfcError, NfcScanSession } from '@src/@core/models/mbc';

export interface NfcProtocol {
  /** Check if Web NFC is supported and permission granted */
  isSupported(): boolean;

  /** Start scanning for NFC tags. Returns a session with abort controller to stop. */
  startScan(
    onRead: (data: Uint8Array) => void,
    onError: (err: NfcError) => void,
  ): NfcScanSession;

  /** Write data to the next tapped NFC tag */
  write(data: Uint8Array): Promise<void>;
}
