import { describe, expect, it, vi } from 'vitest';

import type { NfcProtocol } from '@core/protocols/nfc';
import type { NfcError, NfcScanSession } from '@core/services/mbc/models';

import { NfcService } from '../../mbc/nfc.service';

function createMockNfcProtocol(
  overrides: Partial<NfcProtocol> = {},
): NfcProtocol {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue('granted'),
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

  describe('requestPermission', () => {
    it('delegates to protocol and returns granted', async () => {
      const protocol = createMockNfcProtocol({
        requestPermission: vi.fn().mockResolvedValue('granted'),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.requestPermission();

      expect(result).toBe('granted');
      expect(protocol.requestPermission).toHaveBeenCalledOnce();
    });

    it('returns denied when permission is denied', async () => {
      const protocol = createMockNfcProtocol({
        requestPermission: vi.fn().mockResolvedValue('denied'),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.requestPermission();

      expect(result).toBe('denied');
    });

    it('returns unsupported when NFC is not available', async () => {
      const protocol = createMockNfcProtocol({
        requestPermission: vi.fn().mockResolvedValue('unsupported'),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.requestPermission();

      expect(result).toBe('unsupported');
    });
  });

  describe('readCard', () => {
    it('resolves with data from the first NFC read', async () => {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockAbort = vi.fn();

      const protocol = createMockNfcProtocol({
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            // Simulate async NFC read
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

  describe('writeCard', () => {
    it('delegates write to protocol', async () => {
      const testData = new Uint8Array([10, 20, 30]);
      const protocol = createMockNfcProtocol();
      const service = NfcService({ nfcProtocol: protocol });

      await service.writeCard(testData);

      expect(protocol.write).toHaveBeenCalledWith(testData);
    });

    it('propagates write errors', async () => {
      const protocol = createMockNfcProtocol({
        write: vi.fn().mockRejectedValue(new Error('Write failed')),
      });
      const service = NfcService({ nfcProtocol: protocol });

      await expect(service.writeCard(new Uint8Array([1]))).rejects.toThrow(
        'Write failed',
      );
    });
  });

  describe('writeAndVerify', () => {
    it('returns success when written data matches read-back', async () => {
      const testData = new Uint8Array([1, 2, 3]);

      const protocol = createMockNfcProtocol({
        write: vi.fn().mockResolvedValue(undefined),
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            // Return the same data that was written
            setTimeout(() => onRead(new Uint8Array([1, 2, 3])), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.writeAndVerify(testData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns failure when read-back does not match', async () => {
      const testData = new Uint8Array([1, 2, 3]);

      const protocol = createMockNfcProtocol({
        write: vi.fn().mockResolvedValue(undefined),
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            // Return different data
            setTimeout(() => onRead(new Uint8Array([4, 5, 6])), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.writeAndVerify(testData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('mbc_error_write_verification_failed');
    });

    it('returns failure when write throws', async () => {
      const protocol = createMockNfcProtocol({
        write: vi.fn().mockRejectedValue(new Error('Connection lost')),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.writeAndVerify(new Uint8Array([1]));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection lost');
    });

    it('returns failure when verification read throws', async () => {
      const protocol = createMockNfcProtocol({
        write: vi.fn().mockResolvedValue(undefined),
        startScan: vi.fn().mockImplementation(
          (_onRead: (data: Uint8Array) => void, onError: (err: NfcError) => void): NfcScanSession => {
            setTimeout(() => onError({
              type: 'read_failed',
              message: 'Tag removed during verification',
              messageKey: 'nfc_error_read_failed',
            }), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.writeAndVerify(new Uint8Array([1, 2]));

      expect(result.success).toBe(false);
      expect(result.error).toContain('nfc_error_read_failed');
    });

    it('handles empty data arrays', async () => {
      const emptyData = new Uint8Array([]);

      const protocol = createMockNfcProtocol({
        write: vi.fn().mockResolvedValue(undefined),
        startScan: vi.fn().mockImplementation(
          (onRead: (data: Uint8Array) => void): NfcScanSession => {
            setTimeout(() => onRead(new Uint8Array([])), 10);
            return { abort: vi.fn() };
          },
        ),
      });
      const service = NfcService({ nfcProtocol: protocol });

      const result = await service.writeAndVerify(emptyData);

      expect(result.success).toBe(true);
    });
  });
});
