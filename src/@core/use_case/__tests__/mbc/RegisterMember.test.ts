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
    encrypt: vi.fn().mockReturnValue(new Uint8Array([99])),
    decrypt: vi.fn(),
  };

  return { nfcService, cardDataService, silentShieldService };
}

describe('RegisterMemberUseCase', () => {
  it('registers a blank card successfully', async () => {
    const mocks = createMocks();
    // Simulate blank card: decrypt throws (no valid data)
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    const useCase = RegisterMemberUseCase(mocks);
    const result = await useCase.execute({
      member: { name: 'John Doe', memberId: 'M001' },
    });

    expect(result.type).toBe('registration');
    expect(result.memberName).toBe('John Doe');
    expect(result.newBalance).toBe(0);
    expect(mocks.nfcService.writeAndVerify).toHaveBeenCalledOnce();
  });

  it('rejects if card already has member data', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockReturnValue(new Uint8Array([1]));
    (mocks.cardDataService.deserialize as ReturnType<typeof vi.fn>).mockReturnValue({
      version: 1,
      member: { name: 'Existing User', memberId: 'M999' },
      balance: 5000,
      checkIn: null,
      transactions: [],
    });

    const useCase = RegisterMemberUseCase(mocks);

    await expect(
      useCase.execute({ member: { name: 'New User', memberId: 'M002' } }),
    ).rejects.toThrow('Card already registered');
  });

  it('throws when write verification fails', async () => {
    const mocks = createMocks();
    (mocks.silentShieldService.decrypt as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Decryption failed');
    });
    (mocks.nfcService.writeAndVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: 'Tag removed',
    });

    const useCase = RegisterMemberUseCase(mocks);

    await expect(
      useCase.execute({ member: { name: 'Test', memberId: 'M003' } }),
    ).rejects.toThrow('Registration failed');
  });

  it('throws when NFC read fails', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC read failed'),
    );

    const useCase = RegisterMemberUseCase(mocks);

    await expect(
      useCase.execute({ member: { name: 'Test', memberId: 'M004' } }),
    ).rejects.toThrow('NFC read failed');
  });
});
