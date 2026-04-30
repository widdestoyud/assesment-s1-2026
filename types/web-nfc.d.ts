/**
 * Web NFC API type declarations.
 * @see https://w3c.github.io/web-nfc/
 *
 * These types are not included in TypeScript's standard lib
 * because Web NFC is only supported in Chrome Android 89+.
 */

interface NDEFMessage {
  records: ReadonlyArray<NDEFRecord>;
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: string | BufferSource | NDEFMessageInit;
}

declare class NDEFReader {
  constructor();
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  scan(options?: NDEFScanOptions): Promise<void>;
  write(
    message: NDEFMessageInit | string,
    options?: NDEFWriteOptions,
  ): Promise<void>;
}
