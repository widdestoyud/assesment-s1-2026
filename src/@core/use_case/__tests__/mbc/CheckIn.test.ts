import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { CheckInUseCase } from '../../mbc/CheckIn';

const IDLE_CARD: CardData = {
  v: 2,
  b: 10000,
  s: 0,
  t: null,
  h: [],
};

const CHECKED_IN_CARD: CardData = {
  v: 2,
  b: 10000,
  s: 1,
  t: '2024-01-01T10:00:00.000Z',
  h: [{ ts: 1704103200, a: 0, tp: 'ci' }],
};

function createMocks(cardData: CardData = IDLE_CARD) {
  const nfcService: NfcServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    readCard: vi.fn().mockResolvedValue(new Uint8Array([1])),
    writeCard: vi.fn().mockResolvedValue(undefined),
    writeAndVerify: vi.fn().mockResolvedValue({ success: true }),
    readThenWrite: vi.fn().mockImplementation(async (processor: (data: Uint8Array) => Promise<Uint8Array>) => {
      await processor(new Uint8Array([1]));
      return new Uint8Array([1]);
    }),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10])),
    deserialize: vi.fn().mockReturnValue(cardData),
    createBlank: vi.fn().mockReturnValue({ v: 2, b: 0, s: 0, t: null, h: [] }),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn().mockImplementation((card: CardData, timestamp: string) => ({
      ...card,
      s: 1,
      t: timestamp,
      h: [{ ts: Math.floor(new Date(timestamp).getTime() / 1000), a: 0, tp: 'ci' }, ...card.h].slice(0, 5),
    })),
    applyCheckOut: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('CheckInUseCase', () => {
  it('checks in successfully and returns checkInTime', async () => {
    const mocks = createMocks();
    const useCase = CheckInUseCase(mocks);

    const result = await useCase.execute();

    expect(result.checkInTime).toBeDefined();
    expect(typeof result.checkInTime).toBe('string');
    expect(mocks.nfcService.readThenWrite).toHaveBeenCalledOnce();
  });

  it('rejects double check-in (card already checked in)', async () => {
    const mocks = createMocks(CHECKED_IN_CARD);
    const useCase = CheckInUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('mbc_error_already_checked_in');
  });

  it('throws when NFC readThenWrite fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readThenWrite as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC write failed'),
    );
    const useCase = CheckInUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('NFC write failed');
  });

  it('calls decrypt → deserialize → applyCheckIn → serialize → encrypt', async () => {
    const mocks = createMocks();
    const useCase = CheckInUseCase(mocks);

    await useCase.execute();

    // The processor inside readThenWrite should call these in order
    expect(mocks.silentShieldService.decrypt).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.deserialize).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.applyCheckIn).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.serialize).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.encrypt).toHaveBeenCalledOnce();
  });
});
