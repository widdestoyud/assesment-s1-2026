import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { PricingServiceInterface } from '@core/services/mbc/pricing.service';

import { CheckOutUseCase } from '../../mbc/CheckOut';

const CHECKED_IN_CARD: CardData = {
  v: 2,
  b: 50000,
  s: 1,
  t: '2024-01-01T10:00:00.000Z',
  h: [{ ts: 1704103200, a: 0, tp: 'ci' }],
};

const NOT_CHECKED_IN_CARD: CardData = {
  v: 2,
  b: 50000,
  s: 0,
  t: null,
  h: [],
};

function createMocks(cardData: CardData = CHECKED_IN_CARD) {
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
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn().mockImplementation((card: CardData, fee: number) => ({
      ...card,
      b: card.b - fee,
      s: 0,
      t: null,
      h: [{ ts: Math.floor(Date.now() / 1000), a: -fee, tp: 'co' }, ...card.h].slice(0, 5),
    })),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(new Uint8Array([1])),
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

  return { nfcService, cardDataService, silentShieldService, pricingService };
}

describe('CheckOutUseCase', () => {
  it('processes check-out successfully', async () => {
    const mocks = createMocks();
    const useCase = CheckOutUseCase(mocks);

    const result = await useCase.execute();

    expect(result.fee).toBe(6000);
    expect(result.remainingBalance).toBe(44000);
    expect(result.feeBreakdown.usageUnits).toBe(3);
    expect(result.duration).toBeDefined();
    expect(mocks.nfcService.readThenWrite).toHaveBeenCalledOnce();
  });

  it('rejects when not checked in', async () => {
    const mocks = createMocks(NOT_CHECKED_IN_CARD);
    const useCase = CheckOutUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('mbc_error_not_checked_in');
  });

  it('rejects when balance is insufficient', async () => {
    const lowBalance: CardData = { v: 2, b: 1000, s: 1, t: '2024-01-01T10:00:00.000Z', h: [] };
    const mocks = createMocks(lowBalance);
    // Fee is 6000 but balance is only 1000
    const useCase = CheckOutUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('mbc_error_insufficient_balance');
  });

  it('throws when NFC readThenWrite fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readThenWrite as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC write failed'),
    );
    const useCase = CheckOutUseCase(mocks);

    await expect(useCase.execute()).rejects.toThrow('NFC write failed');
  });

  it('calls pricingService.calculateFee with DEFAULT_PARKING_BENEFIT pricing', async () => {
    const mocks = createMocks();
    const useCase = CheckOutUseCase(mocks);

    await useCase.execute();

    expect(mocks.pricingService.calculateFee).toHaveBeenCalledWith(
      expect.objectContaining({ ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'ceiling' }),
      '2024-01-01T10:00:00.000Z',
      expect.any(String),
    );
  });
});
