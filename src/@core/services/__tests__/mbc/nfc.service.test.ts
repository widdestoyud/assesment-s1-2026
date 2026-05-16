import { describe, expect, it, vi } from 'vitest';

import type { ChipTransferProtocol } from '@core/protocols/chip-transfer';
import type { ChipTransferError, ChipTransferScanSession } from '@core/models/mbc';

import { ChipTransferService } from '../../mbc/nfc.service';

function createMockChipTransferProtocol(
  overrides: Partial<ChipTransferProtocol> = {},
): ChipTransferProtocol {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    startScan: vi.fn().mockReturnValue({ abort: vi.fn() }),
    write: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ChipTransferService', () => {
  describe('isAvailable', () => {
    it('returns true when NFC is supported', () => {
      const protocol = createMockChipTransferProtocol({
        isSupported: vi.fn().mockReturnValue(true),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      expect(service.isAvailable()).toBe(true);
    });

    it('returns false when NFC is not supported', () => {
      const protocol = createMockChipTransferProtocol({
        isSupported: vi.fn().mockReturnValue(false),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('readCard', () => {
    it('resolves with data from the first NFC read', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockAbort = vi.fn();

      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): ChipTransferScanSession => {
            setTimeout(() => onRead(testData), 10);
            return { abort: mockAbort };
          },
        ),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const result = await service.readCard();

      expect(result).toEqual(testData);
      expect(mockAbort).toHaveBeenCalledOnce();
    });

    it('rejects when NFC read fails', async () => {
      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (_onRead: (data: Uint8Array) => void, onError: (err: ChipTransferError) => void): ChipTransferScanSession => {
            setTimeout(() => onError({
              type: 'read_failed',
              message: 'Tag removed too quickly',
              messageKey: 'nfc_error_read_failed',
            }), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(service.readCard()).rejects.toThrow('nfc_error_read_failed');
    });
  });

  describe('readThenWrite', () => {
    it('reads card, processes data, and writes back', async () => {
      const originalData = new Uint8Array([1, 2, 3]);
      const processedData = new Uint8Array([4, 5, 6]);

      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): ChipTransferScanSession => {
            setTimeout(() => onRead(originalData), 10);
            return { abort: vi.fn() };
          },
        ),
        write: vi.fn().mockResolvedValue(undefined),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const result = await service.readThenWrite(async () => processedData);

      expect(result).toEqual(originalData);
      expect(protocol.write).toHaveBeenCalledWith(processedData);
    });

    it('rejects when processor throws', async () => {
      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): ChipTransferScanSession => {
            setTimeout(() => onRead(new Uint8Array([1])), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(
        service.readThenWrite(async () => { throw new Error('Processing failed'); }),
      ).rejects.toThrow('Processing failed');
    });

    it('rejects when write fails after processing', async () => {
      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): ChipTransferScanSession => {
            setTimeout(() => onRead(new Uint8Array([1])), 10);
            return { abort: vi.fn() };
          },
        ),
        write: vi.fn().mockRejectedValue(new Error('Write failed')),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(
        service.readThenWrite(async () => new Uint8Array([2])),
      ).rejects.toThrow('Write failed');
    });

    it('rejects when scan fails', async () => {
      const protocol = createMockChipTransferProtocol({
        startScan: vi.fn().mockImplementation(
          (_onRead: (data: Uint8Array) => void, onError: (err: ChipTransferError) => void): ChipTransferScanSession => {
            setTimeout(() => onError({
              type: 'hardware_unavailable',
              message: 'NFC not available',
              messageKey: 'mbc_nfc_error_hardware_unavailable',
            }), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(
        service.readThenWrite(async () => new Uint8Array([1])),
      ).rejects.toThrow('mbc_nfc_error_hardware_unavailable');
    });
  });
});
