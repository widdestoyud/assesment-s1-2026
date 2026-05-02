import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { ReadCardUseCase } from '../../mbc/ReadCard';

const REGISTERED_CARD: CardData = {
  version: 1,
  member: { name: 'John Doe', memberId: 'M001' },
  balance: 25000,
  checkIn: null,
  transactions: [
    { amount: 50000, timestamp: '2024-01-01T09:00:00.000Z', activityType: 'top-up', serviceTypeId: 'top-up' },
    { amount: -6000, timestamp: '2024-01-01T13:00:00.000Z', activityType: 'parking-fee', serviceTypeId: 'parking' },
  ],
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
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
    appendTransactionLog: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('ReadCardUseCase', () => {
  it('reads card data successfully', async () => {
    const mocks = createMocks();
    const useCase = ReadCardUseCase(mocks);

    const result = await useCase.execute();

    expect(result.member.name).toBe('John Doe');
    expect(result.balance).toBe(25000);
    expect(result.transactions).toHaveLength(2);
    // Verify no writes occurred
    expect(mocks.nfcService.writeCard).not.toHaveBeenCalled();
    expect(mocks.nfcService.writeAndVerify).not.toHaveBeenCalled();
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
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('not registered');
  });

  it('throws when NFC read fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC read failed'),
    );
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('NFC read failed');
  });

  it('throws when decryption fails', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Decryption failed: invalid auth tag'),
    );
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('Decryption failed');
  });

  it('throws when deserialization fails (corrupted data)', async () => {
    const mocks = createMocks();
    (mocks.cardDataService.deserialize as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid card data: version: Required');
    });
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('Invalid card data');
  });
});
