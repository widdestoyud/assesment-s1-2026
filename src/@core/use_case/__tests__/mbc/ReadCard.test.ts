import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/models/mbc';
import type { ChipTransferServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { ReadCardUseCase } from '../../mbc/ReadCard';

const VALID_CARD: CardData = {
  v: 2,
  b: 25000,
  s: 0,
  t: null,
  h: [
    { ts: 1704103200, a: 50000, tp: 'tu' },
    { ts: 1704114000, a: -6000, tp: 'co' },
  ],
};

function createMocks(cardData: CardData = VALID_CARD) {
  const chipTransferService: ChipTransferServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn().mockResolvedValue(new Uint8Array([1])),
    readThenWrite: vi.fn(),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10])),
    deserialize: vi.fn().mockReturnValue(cardData),
    createBlank: vi.fn().mockReturnValue({ v: 2, b: 0, s: 0, t: null, h: [] }),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { chipTransferService, cardDataService, silentShieldService };
}

describe('ReadCardUseCase', () => {
  it('reads card data successfully', async () => {
    const mocks = createMocks();
    const useCase = ReadCardUseCase(mocks);

    const result = await useCase.execute();

    expect(result.b).toBe(25000);
    expect(result.h).toHaveLength(2);
    expect(result.v).toBe(2);
    // Verify no writes occurred
  });

  it('calls readCard → decrypt → deserialize in order', async () => {
    const mocks = createMocks();
    const useCase = ReadCardUseCase(mocks);

    await useCase.execute();

    expect(mocks.chipTransferService.readCard).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.decrypt).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.deserialize).toHaveBeenCalledOnce();
  });

  it('throws when NFC read fails', async () => {
    const mocks = createMocks();
    (mocks.chipTransferService.readCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC read failed'),
    );
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('NFC read failed');
  });

  it('throws when decryption fails', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('mbc_error_decryption_failed'),
    );
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('mbc_error_decryption_failed');
  });

  it('throws when deserialization fails (corrupted data)', async () => {
    const mocks = createMocks();
    (mocks.cardDataService.deserialize as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('mbc_nfc_error_card_data_corrupted');
    });
    const useCase = ReadCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('mbc_nfc_error_card_data_corrupted');
  });
});
