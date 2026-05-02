import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { CheckInUseCase } from '../../mbc/CheckIn';

const REGISTERED_CARD: CardData = {
  version: 1,
  member: { name: 'John Doe', memberId: 'M001' },
  balance: 10000,
  checkIn: null,
  transactions: [],
};

const CHECKED_IN_CARD: CardData = {
  ...REGISTERED_CARD,
  checkIn: {
    timestamp: '2024-01-01T10:00:00.000Z',
    serviceTypeId: 'parking',
    deviceId: 'device-123',
  },
};

function createMocks(cardData: CardData = REGISTERED_CARD) {
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
    applyCheckIn: vi.fn().mockImplementation((card, serviceTypeId, deviceId, timestamp) => ({
      ...card,
      checkIn: { timestamp, serviceTypeId, deviceId },
    })),
    applyCheckOut: vi.fn(),
    appendTransactionLog: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('CheckInUseCase', () => {
  it('checks in successfully', async () => {
    const mocks = createMocks();
    const useCase = CheckInUseCase(mocks);

    const result = await useCase.execute({
      serviceTypeId: 'parking',
      serviceTypeName: 'Parkir',
      deviceId: 'device-abc',
    });

    expect(result.memberName).toBe('John Doe');
    expect(result.serviceTypeName).toBe('Parkir');
    expect(result.entryTime).toBeDefined();
    expect(mocks.nfcService.writeAndVerify).toHaveBeenCalledOnce();
  });

  it('uses simulation timestamp when provided', async () => {
    const mocks = createMocks();
    const useCase = CheckInUseCase(mocks);
    const simTime = '2024-06-15T08:00:00.000Z';

    const result = await useCase.execute({
      serviceTypeId: 'parking',
      serviceTypeName: 'Parkir',
      deviceId: 'device-abc',
      simulationTimestamp: simTime,
    });

    expect(result.entryTime).toBe(simTime);
    expect(mocks.cardDataService.applyCheckIn).toHaveBeenCalledWith(
      expect.anything(),
      'parking',
      'device-abc',
      simTime,
    );
  });

  it('rejects double check-in', async () => {
    const mocks = createMocks(CHECKED_IN_CARD);
    const useCase = CheckInUseCase(mocks);

    await expect(
      useCase.execute({
        serviceTypeId: 'parking',
        serviceTypeName: 'Parkir',
        deviceId: 'device-abc',
      }),
    ).rejects.toThrow('already checked in');
  });

  it('rejects unregistered card', async () => {
    const unregistered: CardData = {
      version: 1,
      member: { name: '', memberId: '' },
      balance: 0,
      checkIn: null,
      transactions: [],
    };
    const mocks = createMocks(unregistered);
    const useCase = CheckInUseCase(mocks);

    await expect(
      useCase.execute({
        serviceTypeId: 'parking',
        serviceTypeName: 'Parkir',
        deviceId: 'device-abc',
      }),
    ).rejects.toThrow('not registered');
  });

  it('throws when write verification fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.writeAndVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Tag removed',
    });
    const useCase = CheckInUseCase(mocks);

    await expect(
      useCase.execute({
        serviceTypeId: 'parking',
        serviceTypeName: 'Parkir',
        deviceId: 'device-abc',
      }),
    ).rejects.toThrow('Check-in failed');
  });
});
