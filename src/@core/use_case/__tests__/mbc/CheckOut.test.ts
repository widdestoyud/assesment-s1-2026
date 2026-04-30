import { describe, expect, it, vi } from 'vitest';

import type { CardData, ServiceType } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { PricingServiceInterface } from '@core/services/mbc/pricing.service';
import type { ServiceRegistryServiceInterface } from '@core/services/mbc/service-registry.service';

import { CheckOutUseCase } from '../../mbc/CheckOut';

const PARKING_SERVICE: ServiceType = {
  id: 'parking',
  displayName: 'Parkir',
  activityType: 'parking-fee',
  pricing: { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'ceiling' },
};

const CHECKED_IN_CARD: CardData = {
  version: 1,
  member: { name: 'John Doe', memberId: 'M001' },
  balance: 50000,
  checkIn: {
    timestamp: '2024-01-01T10:00:00.000Z',
    serviceTypeId: 'parking',
    deviceId: 'device-123',
  },
  transactions: [],
};

function createMocks(cardData: CardData = CHECKED_IN_CARD) {
  const nfcService: NfcServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    readCard: vi.fn().mockResolvedValue(new Uint8Array([1])),
    writeCard: vi.fn().mockResolvedValue(undefined),
    writeAndVerify: vi.fn().mockResolvedValue({ success: true }),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10])),
    deserialize: vi.fn().mockReturnValue(cardData),
    validate: vi.fn().mockReturnValue({ success: true }),
    applyRegistration: vi.fn(),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn().mockImplementation((card, fee) => ({
      ...card,
      balance: card.balance - fee,
      checkIn: null,
    })),
    appendTransactionLog: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockReturnValue(new Uint8Array([99])),
    decrypt: vi.fn().mockReturnValue(new Uint8Array([1])),
  };

  const pricingService: PricingServiceInterface = {
    calculateFee: vi.fn().mockReturnValue({
      fee: 6000,
      usageUnits: 3,
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

  return { nfcService, cardDataService, silentShieldService, pricingService, serviceRegistryService };
}

describe('CheckOutUseCase', () => {
  it('processes check-out successfully', async () => {
    const mocks = createMocks();
    const useCase = CheckOutUseCase(mocks);

    const result = await useCase.execute({ currentDeviceId: 'device-123' });

    expect(result.serviceTypeName).toBe('Parkir');
    expect(result.fee).toBe(6000);
    expect(result.remainingBalance).toBe(44000);
    expect(result.feeBreakdown.usageUnits).toBe(3);
    expect(mocks.nfcService.writeAndVerify).toHaveBeenCalledOnce();
  });

  it('rejects when not checked in', async () => {
    const notCheckedIn: CardData = { ...CHECKED_IN_CARD, checkIn: null };
    const mocks = createMocks(notCheckedIn);
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'device-123' }),
    ).rejects.toThrow('has not checked in');
  });

  it('rejects on device ID mismatch', async () => {
    const mocks = createMocks();
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'wrong-device' }),
    ).rejects.toThrow('Device mismatch');
  });

  it('rejects when service type not found', async () => {
    const mocks = createMocks();
    (mocks.serviceRegistryService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'device-123' }),
    ).rejects.toThrow('not found in registry');
  });

  it('rejects when balance is insufficient', async () => {
    const lowBalance: CardData = { ...CHECKED_IN_CARD, balance: 1000 };
    const mocks = createMocks(lowBalance);
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'device-123' }),
    ).rejects.toThrow('Insufficient balance');
  });

  it('attempts rollback when write verification fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.writeAndVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Tag removed',
    });
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'device-123' }),
    ).rejects.toThrow('rolled back');
    // Verify rollback was attempted
    expect(mocks.nfcService.writeCard).toHaveBeenCalledOnce();
  });

  it('reports critical error when rollback also fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.writeAndVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Tag removed',
    });
    (mocks.nfcService.writeCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Rollback write failed'),
    );
    const useCase = CheckOutUseCase(mocks);

    await expect(
      useCase.execute({ currentDeviceId: 'device-123' }),
    ).rejects.toThrow('CRITICAL');
  });
});
