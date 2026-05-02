import { describe, expect, it, vi } from 'vitest';

import type { BenefitType } from '@core/services/mbc/models';
import type { BenefitRegistryServiceInterface } from '@core/services/mbc/benefit-registry.service';

import { DEFAULT_PARKING_BENEFIT } from '@core/services/mbc/models';
import { ManageBenefitRegistryUseCase } from '../../mbc/ManageBenefitRegistry';

const BIKE_RENTAL: BenefitType = {
  id: 'bike-rental',
  displayName: 'Sewa Sepeda',
  activityType: 'bike-rental',
  pricing: { ratePerUnit: 5000, unitType: 'per-hour', roundingStrategy: 'ceiling' },
};

function createMocks() {
  const benefitRegistryService: BenefitRegistryServiceInterface = {
    getAll: vi.fn().mockResolvedValue([DEFAULT_PARKING_BENEFIT]),
    getById: vi.fn().mockResolvedValue(DEFAULT_PARKING_BENEFIT),
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    initializeDefaults: vi.fn().mockResolvedValue(undefined),
  };

  return { benefitRegistryService };
}

describe('ManageBenefitRegistryUseCase', () => {
  it('initializes defaults on first getAll call', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.getAll();

    expect(mocks.benefitRegistryService.initializeDefaults).toHaveBeenCalledOnce();
    expect(mocks.benefitRegistryService.getAll).toHaveBeenCalledOnce();
  });

  it('does not re-initialize on subsequent calls', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.getAll();
    await useCase.getAll();

    // initializeDefaults should only be called once
    expect(mocks.benefitRegistryService.initializeDefaults).toHaveBeenCalledOnce();
    expect(mocks.benefitRegistryService.getAll).toHaveBeenCalledTimes(2);
  });

  it('delegates add to service', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.add(BIKE_RENTAL);

    expect(mocks.benefitRegistryService.add).toHaveBeenCalledWith(BIKE_RENTAL);
  });

  it('delegates update to service', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.update('parking', { displayName: 'Parkir Mobil' });

    expect(mocks.benefitRegistryService.update).toHaveBeenCalledWith(
      'parking',
      { displayName: 'Parkir Mobil' },
    );
  });

  it('delegates remove to service', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.remove('parking');

    expect(mocks.benefitRegistryService.remove).toHaveBeenCalledWith('parking');
  });

  it('explicit initializeDefaults sets initialized flag', async () => {
    const mocks = createMocks();
    const useCase = ManageBenefitRegistryUseCase(mocks);

    await useCase.initializeDefaults();
    await useCase.getAll();

    // initializeDefaults called once explicitly, not again on getAll
    expect(mocks.benefitRegistryService.initializeDefaults).toHaveBeenCalledOnce();
  });
});
