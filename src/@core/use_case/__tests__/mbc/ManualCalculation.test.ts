import { describe, expect, it, vi } from 'vitest';

import type { ServiceType } from '@core/services/mbc/models';
import type { PricingServiceInterface } from '@core/services/mbc/pricing.service';
import type { ServiceRegistryServiceInterface } from '@core/services/mbc/service-registry.service';

import { ManualCalculationUseCase } from '../../mbc/ManualCalculation';

const PARKING_SERVICE: ServiceType = {
  id: 'parking',
  displayName: 'Parkir',
  activityType: 'parking-fee',
  pricing: { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'ceiling' },
};

function createMocks() {
  const pricingService: PricingServiceInterface = {
    calculateFee: vi.fn().mockReturnValue({
      fee: 4000,
      usageUnits: 2,
      unitLabel: 'jam',
      ratePerUnit: 2000,
      roundingApplied: 'ceiling',
    }),
  };

  const serviceRegistryService: ServiceRegistryServiceInterface = {
    getAll: vi.fn().mockResolvedValue([PARKING_SERVICE]),
    getById: vi.fn().mockResolvedValue(PARKING_SERVICE),
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    initializeDefaults: vi.fn().mockResolvedValue(undefined),
  };

  return { pricingService, serviceRegistryService };
}

describe('ManualCalculationUseCase', () => {
  it('calculates fee successfully', async () => {
    const mocks = createMocks();
    const useCase = ManualCalculationUseCase(mocks);

    const result = await useCase.execute({
      checkInTimestamp: '2024-01-01T10:00:00.000Z',
      serviceTypeId: 'parking',
    });

    expect(result.fee).toBe(4000);
    expect(result.usageUnits).toBe(2);
    expect(result.ratePerUnit).toBe(2000);
    expect(mocks.pricingService.calculateFee).toHaveBeenCalledOnce();
  });

  it('rejects when service type not found', async () => {
    const mocks = createMocks();
    (mocks.serviceRegistryService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const useCase = ManualCalculationUseCase(mocks);

    await expect(
      useCase.execute({
        checkInTimestamp: '2024-01-01T10:00:00.000Z',
        serviceTypeId: 'nonexistent',
      }),
    ).rejects.toThrow('not found in registry');
  });

  it('rejects invalid timestamp format', async () => {
    const mocks = createMocks();
    const useCase = ManualCalculationUseCase(mocks);

    await expect(
      useCase.execute({
        checkInTimestamp: 'not-a-date',
        serviceTypeId: 'parking',
      }),
    ).rejects.toThrow('Invalid check-in timestamp');
  });

  it('does not perform any NFC operations', async () => {
    const mocks = createMocks();
    const useCase = ManualCalculationUseCase(mocks);

    await useCase.execute({
      checkInTimestamp: '2024-01-01T10:00:00.000Z',
      serviceTypeId: 'parking',
    });

    // ManualCalculation should never touch NFC
    expect(mocks.pricingService.calculateFee).toHaveBeenCalledOnce();
  });
});
