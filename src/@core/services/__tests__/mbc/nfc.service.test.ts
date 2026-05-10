import { describe, expect, it, vi } from 'vitest';

import type { NfcProtocol } from '@core/protocols/nfc';
import type { NfcError, NfcScanSession } from '@core/models/mbc';

import { NfcService } from '../../mbc/nfc.service';

function createMockNfcProtocol(
  overrides: Partial<NfcProtocol> = {},
): NfcProtocol {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    startScan: vi.fn().mockReturnValue({ abort: vi.fn() }),
    write: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('NfcService', () => {
  describe('isAvailable', () => {
    it('returns true when NFC is supported', () => {
      const protocol = createMockNfcProtocol({
        isSupported: vi.fn().mockReturnValue(true),
      });
      const service = NfcService({ nfcProtocol: protocol });

      expect(service.isAvailable()).toBe(true);
    });

    it('returns false when NFC is not supported', () => {
      const protocol = createMockNfcProtocol({
        isSupported: vi.fn().mockReturnValue(false),
      });
      const service = NfcService({ nfcProtocol: protocol });

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('readCard', () => {
    it('resolves with data from the first NFC read', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockAbort = vi.fn();

      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            setTimeout(() => onRead(testData), 10);
            return { abort: mockAbort };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.readCard();

      expect(result).toEqual(testData);
      expect(mockAbort).toHaveBeenCalledOnce();
    });

    it('rejects when NFC read fails', async () => {
      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (_onRead: (data: Uint8Array) => void, onError: (err: NfcError) => void): NfcScanSession => {
            setTimeout(() => onError({
              type: 'read_failed',
              message: 'Tag removed too quickly',
              messageKey: 'nfc_error_read_failed',
            }), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      await expect(service.readCard()).rejects.toThrow('nfc_error_read_failed');
    });
  });

  describe('readThenWrite', () => {
    it('reads card, processes data, and writes back', async () => {
      const originalData = new Uint8Array([1, 2, 3]);
      const processedData = new Uint8Array([4, 5, 6]);

      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            setTimeout(() => onRead(originalData), 10);
            return { abort: vi.fn() };
          },
        ),
        write: vi.fn().mockResolvedValue(undefined),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.readThenWrite(async () => processedData);

      expect(result).toEqual(originalData);
      expect(protocol.write).toHaveBeenCalledWith(processedData);
    });

    it('rejects when processor throws', async () => {
      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            setTimeout(() => onRead(new Uint8Array([1])), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      await expect(
        service.readThenWrite(async () => { throw new Error('Processing failed'); }),
      ).rejects.toThrow('Processing failed');
    });

    it('rejects when write fails after processing', async () => {
      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            setTimeout(() => onRead(new Uint8Array([1])), 10);
            return { abort: vi.fn() };
          },
        ),
        write: vi.fn().mockRejectedValue(new Error('Write failed')),
      });
      const service = NfcService({ nfcProtocol: protocol });

      await expect(
        service.readThenWrite(async () => new Uint8Array([2])),
      ).rejects.toThrow('Write failed');
    });

    it('rejects when scan fails', async () => {
      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (_onRead: (data: Uint8Array) => void, onError: (err: NfcError) => void): NfcScanSession => {
            setTimeout(() => onError({
              type: 'hardware_unavailable',
              message: 'NFC not available',
              messageKey: 'mbc_nfc_error_hardware_unavailable',
            }), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      await expect(
        service.readThenWrite(async () => new Uint8Array([1])),
      ).rejects.toThrow('mbc_nfc_error_hardware_unavailable');
    });
  });
});
