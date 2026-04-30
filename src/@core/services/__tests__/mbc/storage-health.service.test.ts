import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyValueStoreProtocol } from '@core/protocols/key-value-store';

import { StorageHealthService } from '../../mbc/storage-health.service';

function createMockStore(
  overrides: Partial<KeyValueStoreProtocol> = {},
): KeyValueStoreProtocol {
  return {
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    isAvailable: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('StorageHealthService', () => {
  describe('isAvailable', () => {
    it('returns true when storage is available', async () => {
      const store = createMockStore({ isAvailable: vi.fn().mockResolvedValue(true) });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.isAvailable();

      expect(result).toBe(true);
      expect(store.isAvailable).toHaveBeenCalledOnce();
    });

    it('returns false when storage is unavailable', async () => {
      const store = createMockStore({ isAvailable: vi.fn().mockResolvedValue(false) });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('checkWriteCapacity', () => {
    it('returns canWrite: true when storage is healthy', async () => {
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue('health-check'),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.checkWriteCapacity();

      expect(result.canWrite).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns unavailable error when storage is not available', async () => {
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(false),
      });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.checkWriteCapacity();

      expect(result.canWrite).toBe(false);
      expect(result.error?.type).toBe('unavailable');
    });

    it('returns write_failed when read-back does not match', async () => {
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue('wrong-value'),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.checkWriteCapacity();

      expect(result.canWrite).toBe(false);
      expect(result.error?.type).toBe('write_failed');
    });

    it('returns quota_exceeded when set throws QuotaExceededError', async () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(true),
        set: vi.fn().mockRejectedValue(quotaError),
      });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.checkWriteCapacity();

      expect(result.canWrite).toBe(false);
      expect(result.error?.type).toBe('quota_exceeded');
    });

    it('returns write_failed for generic errors', async () => {
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(true),
        set: vi.fn().mockRejectedValue(new Error('Disk I/O error')),
      });
      const service = StorageHealthService({ keyValueStore: store });

      const result = await service.checkWriteCapacity();

      expect(result.canWrite).toBe(false);
      expect(result.error?.type).toBe('write_failed');
      expect(result.error?.message).toContain('Disk I/O error');
    });

    it('cleans up test key after successful check', async () => {
      const deleteFn = vi.fn().mockResolvedValue(undefined);
      const store = createMockStore({
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue('health-check'),
        set: vi.fn().mockResolvedValue(undefined),
        delete: deleteFn,
      });
      const service = StorageHealthService({ keyValueStore: store });

      await service.checkWriteCapacity();

      expect(deleteFn).toHaveBeenCalledWith('__test__', '__storage_health_check__');
    });
  });
});
