import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { TopUpBalanceUseCase } from '../../mbc/TopUpBalance';

const VALID_CARD: CardData = {
  v: 2,
  b: 10000,
  s: 0,
  t: null,
  h: [],
};

function createMocks(cardData: CardData = VALID_CARD) {
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
    applyTopUp: vi.fn().mockImplementation((card: CardData, amount: number) => ({
      ...card,
      b: card.b + amount,
      h: [{ ts: Math.floor(Date.now() / 1000), a: amount, tp: 'tu' }, ...card.h].slice(0, 5),
    })),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('TopUpBalanceUseCase', () => {
  it('tops up balance successfully', async () => {
    const mocks = createMocks();
    const useCase = TopUpBalanceUseCase(mocks);

    const result = await useCase.execute({ amount: 5000 });

    expect(result.type).toBe('top-up');
    expect(result.balance).toBe(15000);
    expect(mocks.nfcService.readThenWrite).toHaveBeenCalledOnce();
  });

  it('rejects zero amount', async () => {
    const mocks = createMocks();
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: 0 })).rejects.toThrow('mbc_error_topup_amount_invalid');
  });

  it('rejects negative amount', async () => {
    const mocks = createMocks();
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: -1000 })).rejects.toThrow('mbc_error_topup_amount_invalid');
  });

  it('rejects when balance would exceed max', async () => {
    const nearMaxCard: CardData = { v: 2, b: 999000, s: 0, t: null, h: [] };
    const mocks = createMocks(nearMaxCard);
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: 5000 })).rejects.toThrow('mbc_error_balance_exceeds_max');
  });

  it('throws when NFC readThenWrite fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readThenWrite as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC write failed'),
    );
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: 5000 })).rejects.toThrow('NFC write failed');
  });

  it('calls decrypt → deserialize → applyTopUp → serialize → encrypt', async () => {
    const mocks = createMocks();
    const useCase = TopUpBalanceUseCase(mocks);

    await useCase.execute({ amount: 5000 });

    expect(mocks.silentShieldService.decrypt).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.deserialize).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.applyTopUp).toHaveBeenCalledOnce();
    expect(mocks.cardDataService.serialize).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.encrypt).toHaveBeenCalledOnce();
  });
});
