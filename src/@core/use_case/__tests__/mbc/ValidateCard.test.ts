import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/models/mbc';
import type { ChipTransferServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { ValidateCardUseCase } from '../../mbc/ValidateCard';

const VALID_CARD: CardData = {
  v: 2,
  b: 25000,
  s: 0,
  t: null,
  h: [{ ts: 1704103200, a: 50000, tp: 'tu' }],
};

function createMocks() {
  const chipTransferService: ChipTransferServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn().mockResolvedValue(new Uint8Array([1])),
    readThenWrite: vi.fn().mockImplementation(async (processor: (data: Uint8Array) => Promise<Uint8Array>) => {
      await processor(new Uint8Array([1]));
      return new Uint8Array([1]);
    }),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10])),
    deserialize: vi.fn().mockReturnValue(VALID_CARD),
    createBlank: vi.fn().mockReturnValue({ v: 2, b: 0, s: 0, t: null, h: [] }),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
    applySimulationCheckOut: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { chipTransferService, cardDataService, silentShieldService };
}

describe('ValidateCardUseCase', () => {
  it('returns existing card with balance when card is valid', async () => {
    const mocks = createMocks();
    const useCase = ValidateCardUseCase(mocks);

    const result = await useCase.execute();

    expect(result.type).toBe('existing');
    expect(result.balance).toBe(25000);
  });

  it('calls decrypt → deserialize for valid card', async () => {
    const mocks = createMocks();
    const useCase = ValidateCardUseCase(mocks);

    await useCase.execute();

    expect(mocks.silentShieldService.decrypt).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.deserialize).toHaveBeenCalledOnce();
  });

  it('returns raw encrypted data back (no-op write) for valid card', async () => {
    const mocks = createMocks();
    const rawEncrypted = new Uint8Array([1, 2, 3]);
    (mocks.chipTransferService.readThenWrite as ReturnType<typeof vi.fn>).mockImplementation(
      async (processor: (data: Uint8Array) => Promise<Uint8Array>) => {
        const writeData = await processor(rawEncrypted);
        expect(writeData).toBe(rawEncrypted); // Same reference — no-op write
        return rawEncrypted;
      },
    );
    const useCase = ValidateCardUseCase(mocks);

    await useCase.execute();
  });

  it('writes blank card when decryption fails (invalid card)', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('mbc_error_decryption_failed'),
    );
    const useCase = ValidateCardUseCase(mocks);

    const result = await useCase.execute();

    expect(result.type).toBe('new');
    expect(result.balance).toBe(0);
    expect(mocks.cardDataService.createBlank).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.serialize).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.encrypt).toHaveBeenCalledOnce();
  });

  it('writes blank card when deserialization fails (corrupted data)', async () => {
    const mocks = createMocks();
    (mocks.cardDataService.deserialize as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('mbc_nfc_error_card_data_corrupted');
    });
    const useCase = ValidateCardUseCase(mocks);

    const result = await useCase.execute();

    expect(result.type).toBe('new');
    expect(result.balance).toBe(0);
    expect(mocks.cardDataService.createBlank).toHaveBeenCalledOnce();
  });

  it('throws when NFC readThenWrite fails', async () => {
    const mocks = createMocks();
    (mocks.chipTransferService.readThenWrite as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC hardware error'),
    );
    const useCase = ValidateCardUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('NFC hardware error');
  });
});
