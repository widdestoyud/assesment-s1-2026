import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyValueStoreProtocol } from '@core/protocols/key-value-store';

import { DeviceService } from '../../mbc/device.service';
import { MBC_KEYS } from '@utils/constants/mbc-keys';

const STORE_NAME = MBC_KEYS.MBC_STORE_NAME;
const DEVICE_KEY = MBC_KEYS.MBC_DEVICE_ID;

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

// Mock crypto.randomUUID for deterministic tests
const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('DeviceService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(MOCK_UUID as `${string}-${string}-${string}-${string}-${string}`);
  });

  describe('getDeviceId', () => {
    it('returns the stored device ID when it exists', async () => {
      const existingId = 'existing-device-id-123';
      const store = createMockStore({
        get: vi.fn().mockResolvedValue(existingId),
      });
      const service = DeviceService({ keyValueStore: store });

      const result = await service.getDeviceId();

      expect(result).toBe(existingId);
      expect(store.get).toHaveBeenCalledWith(STORE_NAME, DEVICE_KEY);
    });

    it('returns undefined when no device ID is stored', async () => {
      const store = createMockStore({
        get: vi.fn().mockResolvedValue(undefined),
      });
      const service = DeviceService({ keyValueStore: store });

      const result = await service.getDeviceId();

      expect(result).toBeUndefined();
    });
  });

  describe('ensureDeviceId', () => {
    it('returns existing device ID without regeneration', async () => {
      const existingId = 'existing-device-id-456';
      const store = createMockStore({
        get: vi.fn().mockResolvedValue(existingId),
      });
      const service = DeviceService({ keyValueStore: store });

      const result = await service.ensureDeviceId();

      expect(result.deviceId).toBe(existingId);
      expect(result.wasRegenerated).toBe(false);
      expect(store.set).not.toHaveBeenCalled();
    });

    it('generates and persists a new device ID when none exists', async () => {
      const store = createMockStore({
        get: vi.fn().mockResolvedValue(undefined),
      });
      const service = DeviceService({ keyValueStore: store });

      const result = await service.ensureDeviceId();

      expect(result.deviceId).toBe(MOCK_UUID);
      expect(result.wasRegenerated).toBe(true);
      expect(store.set).toHaveBeenCalledWith(STORE_NAME, DEVICE_KEY, MOCK_UUID);
    });

    it('flags wasRegenerated: true only on first generation', async () => {
      let storedValue: string | undefined;
      const store = createMockStore({
        get: vi.fn().mockImplementation(() => Promise.resolve(storedValue)),
        set: vi.fn().mockImplementation((_s: string, _k: string, v: string) => {
          storedValue = v;
          return Promise.resolve();
        }),
      });
      const service = DeviceService({ keyValueStore: store });

      // First call — generates new ID
      const first = await service.ensureDeviceId();
      expect(first.wasRegenerated).toBe(true);

      // Second call — returns existing
      const second = await service.ensureDeviceId();
      expect(second.wasRegenerated).toBe(false);
      expect(second.deviceId).toBe(MOCK_UUID);
    });

    it('propagates storage write errors', async () => {
      const store = createMockStore({
        get: vi.fn().mockResolvedValue(undefined),
        set: vi.fn().mockRejectedValue(new Error('Storage write failed')),
      });
      const service = DeviceService({ keyValueStore: store });

      await expect(service.ensureDeviceId()).rejects.toThrow('Storage write failed');
    });
  });
});
