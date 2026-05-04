import { describe, expect, it, vi } from 'vitest';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { TopUpBalanceUseCase } from '../../mbc/TopUpBalance';

const REGISTERED_CARD: CardData = {
  version: 1,
  member: { name: 'John Doe', memberId: 'M001' },
  balance: 10000,
  checkIn: null,
  transactions: [],
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
    applyTopUp: vi.fn().mockImplementation((card, amount) => ({
      ...card,
      balance: card.balance + amount,
    })),
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

describe('TopUpBalanceUseCase', () => {
  it('tops up balance successfully', async () => {
    const mocks = createMocks();
    const useCase = TopUpBalanceUseCase(mocks);

    const result = await useCase.execute({ amount: 5000 });

    expect(result.type).toBe('top-up');
    expect(result.memberName).toBe('John Doe');
    expect(result.previousBalance).toBe(10000);
    expect(result.amount).toBe(5000);
    expect(result.newBalance).toBe(15000);
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

  it('rejects unregistered card', async () => {
    const unregistered: CardData = {
      version: 1,
      member: { name: '', memberId: '' },
      balance: 0,
      checkIn: null,
      transactions: [],
    };
    const mocks = createMocks(unregistered);
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: 5000 })).rejects.toThrow('mbc_error_not_registered');
  });

  it('throws when write verification fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.writeAndVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Connection lost',
    });
    const useCase = TopUpBalanceUseCase(mocks);

    await expect(useCase.execute({ amount: 5000 })).rejects.toThrow('mbc_error_write_verification_failed');
  });
});
