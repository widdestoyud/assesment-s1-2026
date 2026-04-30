import { describe, expect, it, vi } from 'vitest';

import type { ServiceType } from '@core/services/mbc/models';
import type { ServiceRegistryServiceInterface } from '@core/services/mbc/service-registry.service';

import { DEFAULT_PARKING_SERVICE } from '@core/services/mbc/models';
import { ManageServiceRegistryUseCase } from '../../mbc/ManageServiceRegistry';

const BIKE_RENTAL: ServiceType = {
  id: 'bike-rental',
  displayName: 'Sewa Sepeda',
  activityType: 'bike-rental',
  pricing: { ratePerUnit: 5000, unitType: 'per-hour', roundingStrategy: 'ceiling' },
};

function createMocks() {
  const serviceRegistryService: ServiceRegistryServiceInterface = {
    getAll: vi.fn().mockResolvedValue([DEFAULT_PARKING_SERVICE]),
    getById: vi.fn().mockResolvedValue(DEFAULT_PARKING_SERVICE),
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    initializeDefaults: vi.fn().mockResolvedValue(undefined),
  };

  return { serviceRegistryService };
}

describe('ManageServiceRegistryUseCase', () => {
  it('initializes defaults on first getAll call', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.getAll();

    expect(mocks.serviceRegistryService.initializeDefaults).toHaveBeenCalledOnce();
    expect(mocks.serviceRegistryService.getAll).toHaveBeenCalledOnce();
  });

  it('does not re-initialize on subsequent calls', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.getAll();
    await useCase.getAll();

    // initializeDefaults should only be called once
    expect(mocks.serviceRegistryService.initializeDefaults).toHaveBeenCalledOnce();
    expect(mocks.serviceRegistryService.getAll).toHaveBeenCalledTimes(2);
  });

  it('delegates add to service', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.add(BIKE_RENTAL);

    expect(mocks.serviceRegistryService.add).toHaveBeenCalledWith(BIKE_RENTAL);
  });

  it('delegates update to service', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.update('parking', { displayName: 'Parkir Mobil' });

    expect(mocks.serviceRegistryService.update).toHaveBeenCalledWith(
      'parking',
      { displayName: 'Parkir Mobil' },
    );
  });

  it('delegates remove to service', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.remove('parking');

    expect(mocks.serviceRegistryService.remove).toHaveBeenCalledWith('parking');
  });

  it('explicit initializeDefaults sets initialized flag', async () => {
    const mocks = createMocks();
    const useCase = ManageServiceRegistryUseCase(mocks);

    await useCase.initializeDefaults();
    await useCase.getAll();

    // initializeDefaults called once explicitly, not again on getAll
    expect(mocks.serviceRegistryService.initializeDefaults).toHaveBeenCalledOnce();
  });
});
