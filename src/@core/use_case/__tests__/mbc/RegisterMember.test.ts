import { describe, expect, it, vi } from 'vitest';

import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';

import { RegisterMemberUseCase } from '../../mbc/RegisterMember';

function createMocks() {
  const nfcService: NfcServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    readCard: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    writeCard: vi.fn().mockResolvedValue(undefined),
    writeAndVerify: vi.fn().mockResolvedValue({ success: true }),
    readThenWrite: vi.fn().mockImplementation(async (processor: (data: Uint8Array) => Promise<Uint8Array>) => { await processor(new Uint8Array([1])); return new Uint8Array([1]); }),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10, 20])),
    deserialize: vi.fn(),
    validate: vi.fn().mockReturnValue({ success: true }),
    applyRegistration: vi.fn().mockImplementation((card, member) => ({
      ...card,
      version: 1,
      member,
      balance: 0,
      checkIn: null,
      transactions: [],
    })),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
    appendTransactionLog: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn(),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('RegisterMemberUseCase', () => {
  it('registers a card successfully with direct write', async () => {
    const mocks = createMocks();
    const useCase = RegisterMemberUseCase(mocks);

    const result = await useCase.execute({
      member: { name: 'John Doe', memberId: 'M001' },
    });

    expect(result.type).toBe('registration');
    expect(result.memberName).toBe('John Doe');
    expect(result.newBalance).toBe(0);
    expect(mocks.nfcService.writeCard).toHaveBeenCalledOnce();
    expect(mocks.nfcService.readCard).not.toHaveBeenCalled();
    expect(mocks.cardDataService.applyRegistration).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.encrypt).toHaveBeenCalledOnce();
  });

  it('serializes and encrypts card data before writing', async () => {
    const mocks = createMocks();
    const useCase = RegisterMemberUseCase(mocks);

    await useCase.execute({
      member: { name: 'Test User', memberId: 'M002' },
    });

    expect(mocks.cardDataService.serialize).toHaveBeenCalledOnce();
    expect(mocks.silentShieldService.encrypt).toHaveBeenCalledWith(new Uint8Array([10, 20]));
    expect(mocks.nfcService.writeCard).toHaveBeenCalledWith(new Uint8Array([99]));
  });

  it('throws when NFC write fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.writeCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC write failed'),
    );

    const useCase = RegisterMemberUseCase(mocks);

    await expect(
      useCase.execute({ member: { name: 'Test', memberId: 'M003' } }),
    ).rejects.toThrow('NFC write failed');
  });

  it('throws when encryption fails', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.encrypt as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Encryption failed'),
    );

    const useCase = RegisterMemberUseCase(mocks);

    await expect(
      useCase.execute({ member: { name: 'Test', memberId: 'M004' } }),
    ).rejects.toThrow('Encryption failed');
  });
});
