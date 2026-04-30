import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { KeyValueStoreProtocol } from '@core/protocols/key-value-store';
import type { ServiceType } from '@core/services/mbc/models';

import { DEFAULT_PARKING_SERVICE } from '@core/services/mbc/models';
import { ServiceRegistryService } from '../../mbc/service-registry.service';
import { MBC_KEYS } from '@utils/constants/mbc-keys';

const STORE_NAME = MBC_KEYS.MBC_STORE_NAME;
const REGISTRY_KEY = MBC_KEYS.MBC_SERVICE_REGISTRY;

const BIKE_RENTAL: ServiceType = {
  id: 'bike-rental',
  displayName: 'Sewa Sepeda',
  activityType: 'bike-rental',
  pricing: {
    ratePerUnit: 5000,
    unitType: 'per-hour',
    roundingStrategy: 'ceiling',
  },
};

const GYM_SESSION: ServiceType = {
  id: 'gym-session',
  displayName: 'Gym Session',
  activityType: 'gym-session',
  pricing: {
    ratePerUnit: 15000,
    unitType: 'per-visit',
    roundingStrategy: 'ceiling',
  },
};

function createMockStore(
  initialData: ServiceType[] = [],
): KeyValueStoreProtocol {
  let stored: ServiceType[] = [...initialData];

  return {
    get: vi.fn().mockImplementation((_s: string, _k: string) =>
      Promise.resolve(stored.length > 0 ? stored : undefined),
    ),
    set: vi.fn().mockImplementation((_s: string, _k: string, value: ServiceType[]) => {
      stored = [...value];
      return Promise.resolve();
    }),
    delete: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    isAvailable: vi.fn().mockResolvedValue(true),
  };
}

describe('ServiceRegistryService', () => {
  describe('initializeDefaults', () => {
    it('creates default parking service when registry is empty', async () => {
      const store = createMockStore([]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.initializeDefaults();

      expect(store.set).toHaveBeenCalledWith(
        STORE_NAME,
        REGISTRY_KEY,
        [DEFAULT_PARKING_SERVICE],
      );
    });

    it('does not overwrite existing registry', async () => {
      const store = createMockStore([BIKE_RENTAL]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.initializeDefaults();

      expect(store.set).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('returns all registered service types', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE, BIKE_RENTAL]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const result = await service.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('parking');
      expect(result[1].id).toBe('bike-rental');
    });

    it('returns empty array when registry is empty', async () => {
      const store = createMockStore([]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('filters out corrupted entries', async () => {
      const corruptedEntry = { id: '', displayName: '' } as unknown as ServiceType;
      const store = createMockStore([DEFAULT_PARKING_SERVICE, corruptedEntry]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const result = await service.getAll();

      // Only the valid parking service should remain
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('parking');
    });
  });

  describe('getById', () => {
    it('returns the service type when found', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE, BIKE_RENTAL]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const result = await service.getById('bike-rental');

      expect(result).toBeDefined();
      expect(result?.id).toBe('bike-rental');
      expect(result?.displayName).toBe('Sewa Sepeda');
    });

    it('returns undefined when not found', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const result = await service.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('add', () => {
    it('adds a valid service type to the registry', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.add(BIKE_RENTAL);

      expect(store.set).toHaveBeenCalledWith(
        STORE_NAME,
        REGISTRY_KEY,
        expect.arrayContaining([
          expect.objectContaining({ id: 'parking' }),
          expect.objectContaining({ id: 'bike-rental' }),
        ]),
      );
    });

    it('throws on duplicate ID', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await expect(service.add(DEFAULT_PARKING_SERVICE)).rejects.toThrow(
        'already exists',
      );
    });

    it('throws on invalid service type data', async () => {
      const store = createMockStore([]);
      const service = ServiceRegistryService({ keyValueStore: store });

      const invalid = {
        id: '',
        displayName: '',
        activityType: '',
        pricing: { ratePerUnit: -1, unitType: 'invalid', roundingStrategy: 'ceiling' },
      } as unknown as ServiceType;

      await expect(service.add(invalid)).rejects.toThrow('Invalid service type');
    });
  });

  describe('update', () => {
    it('updates an existing service type', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.update('parking', { displayName: 'Parkir Mobil' });

      expect(store.set).toHaveBeenCalledWith(
        STORE_NAME,
        REGISTRY_KEY,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'parking',
            displayName: 'Parkir Mobil',
          }),
        ]),
      );
    });

    it('throws when service type not found', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await expect(
        service.update('nonexistent', { displayName: 'Test' }),
      ).rejects.toThrow('not found');
    });

    it('preserves the original ID even if updates try to change it', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      // The update method signature prevents changing ID via Omit<ServiceType, 'id'>
      await service.update('parking', { displayName: 'Updated Parkir' });

      expect(store.set).toHaveBeenCalledWith(
        STORE_NAME,
        REGISTRY_KEY,
        expect.arrayContaining([
          expect.objectContaining({ id: 'parking' }),
        ]),
      );
    });

    it('validates the updated entry', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await expect(
        service.update('parking', { displayName: '' }),
      ).rejects.toThrow('Invalid service type after update');
    });
  });

  describe('remove', () => {
    it('removes an existing service type', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE, BIKE_RENTAL]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.remove('bike-rental');

      expect(store.set).toHaveBeenCalledWith(
        STORE_NAME,
        REGISTRY_KEY,
        expect.arrayContaining([
          expect.objectContaining({ id: 'parking' }),
        ]),
      );
      // Verify bike-rental is not in the saved array
      const savedArg = (store.set as ReturnType<typeof vi.fn>).mock.calls[0][2] as ServiceType[];
      expect(savedArg.find(s => s.id === 'bike-rental')).toBeUndefined();
    });

    it('throws when service type not found', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await expect(service.remove('nonexistent')).rejects.toThrow('not found');
    });

    it('can remove the last service type leaving empty registry', async () => {
      const store = createMockStore([DEFAULT_PARKING_SERVICE]);
      const service = ServiceRegistryService({ keyValueStore: store });

      await service.remove('parking');

      expect(store.set).toHaveBeenCalledWith(STORE_NAME, REGISTRY_KEY, []);
    });
  });
});
