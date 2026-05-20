import { describe, expect, it, vi } from 'vitest';

import type { ChipTransferProtocol } from '@core/protocols/chip-transfer';
import type { ChipTransferError, ChipTransferScanSession } from '@src/@core/models/mbc';

import { ChipTransferService, ChipTransferServiceError } from '../../mbc/nfc.service';

function createMockProtocol(): ChipTransferProtocol {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    startScan: vi.fn().mockImplementation((onRead, _onError) => {
      setTimeout(() => onRead(new Uint8Array([1, 2, 3])), 0);
      return { abort: vi.fn() } as ChipTransferScanSession;
    }),
    write: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ChipTransferServiceError', () => {
  it('sets type, messageKey, and message correctly', () => {
    const chipError: ChipTransferError = {
      type: 'read_failed',
      message: 'Read failed',
      messageKey: 'mbc_nfc_error_read_failed',
    };
    const error = new ChipTransferServiceError(chipError);

    expect(error.type).toBe('read_failed');
    expect(error.messageKey).toBe('mbc_nfc_error_read_failed');
    expect(error.message).toBe('mbc_nfc_error_read_failed');
    expect(error.name).toBe('ChipTransferServiceError');
    expect(error.messageParams).toBeUndefined();
  });

  it('sets messageParams when provided', () => {
    const chipError: ChipTransferError = {
      type: 'hardware_unavailable',
      message: 'Hardware unavailable',
      messageKey: 'mbc_nfc_error_hardware_unavailable',
      messageParams: { device: 'NFC', retryCount: 3 },
    };
    const error = new ChipTransferServiceError(chipError);

    expect(error.messageParams).toEqual({ device: 'NFC', retryCount: 3 });
  });
});

describe('ChipTransferService', () => {
  describe('isAvailable', () => {
    it('returns true when protocol is supported', () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      expect(service.isAvailable()).toBe(true);
      expect(protocol.isSupported).toHaveBeenCalled();
    });

    it('returns false when protocol is not supported', () => {
      const protocol = createMockProtocol();
      (protocol.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('queryPermission', () => {
    it('delegates to protocol queryPermission', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const result = await service.queryPermission();

      expect(result).toBe('supported');
    });

    it('passes onChange callback to protocol', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });
      const onChange = vi.fn();

      await service.queryPermission(onChange);

      expect(protocol.queryPermission).toHaveBeenCalledWith(onChange);
    });
  });

  describe('readCard', () => {
    it('resolves with data from protocol scan', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const result = await service.readCard();

      expect(result).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('rejects with ChipTransferServiceError on scan error', async () => {
      const protocol = createMockProtocol();
      (protocol.startScan as ReturnType<typeof vi.fn>).mockImplementation((_onRead, onError) => {
        setTimeout(() => onError({
          type: 'read_failed',
          message: 'Read failed',
          messageKey: 'mbc_nfc_error_read_failed',
        }), 0);
        return { abort: vi.fn() };
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(service.readCard()).rejects.toThrow(ChipTransferServiceError);
    });
  });

  describe('readThenWrite', () => {
    it('reads data, processes it, and writes back', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const processor = vi.fn().mockResolvedValue(new Uint8Array([10, 20]));
      const result = await service.readThenWrite(processor);

      expect(processor).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
      expect(protocol.write).toHaveBeenCalledWith(new Uint8Array([10, 20]));
      expect(result).toEqual(new Uint8Array([1, 2, 3])); // Returns original read data
    });

    it('rejects when processor throws', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const processor = vi.fn().mockRejectedValue(new Error('Processing failed'));

      await expect(service.readThenWrite(processor)).rejects.toThrow('Processing failed');
    });

    it('rejects with wrapped error when processor throws non-Error', async () => {
      const protocol = createMockProtocol();
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      const processor = vi.fn().mockRejectedValue('string error');

      await expect(service.readThenWrite(processor)).rejects.toThrow('string error');
    });

    it('rejects with ChipTransferServiceError on scan error', async () => {
      const protocol = createMockProtocol();
      (protocol.startScan as ReturnType<typeof vi.fn>).mockImplementation((_onRead, onError) => {
        setTimeout(() => onError({
          type: 'connection_lost',
          message: 'Connection lost',
          messageKey: 'mbc_nfc_error_connection_lost',
        }), 0);
        return { abort: vi.fn() };
      });
      const service = ChipTransferService({ chipTransferProtocol: protocol });

      await expect(service.readThenWrite(vi.fn())).rejects.toThrow(ChipTransferServiceError);
    });
  });
});
