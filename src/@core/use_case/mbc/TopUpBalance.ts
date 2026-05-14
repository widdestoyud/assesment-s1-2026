import type { AwilixRegistry } from '@di/container';
import type { OperationResult } from '@src/@core/models/mbc';
import { MBC_KEYS } from '@utils/constants/mbc-keys';

export interface TopUpBalanceInput {
  amount: number;
}

export interface TopUpBalanceUseCaseInterface {
  execute(input: TopUpBalanceInput): Promise<OperationResult>;
}

export const TopUpBalanceUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): TopUpBalanceUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (input: TopUpBalanceInput): Promise<OperationResult> => {
    if (input.amount < MBC_KEYS.MIN_TOPUP) {
      throw new Error('mbc_error_min_topup');
    }

    let newBalance = 0;

    // Single-tap: read card, process, write back
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      // Decrypt → deserialize
      const decrypted = await silentShieldService.decrypt(rawEncrypted);
      const card = cardDataService.deserialize(decrypted);

      // Validate max balance
      if (card.b + input.amount > MBC_KEYS.MAX_BALANCE) {
        throw new Error('mbc_error_max_balance_exceeded');
      }

      // Apply top-up
      const updatedCard = cardDataService.applyTopUp(card, input.amount);
      newBalance = updatedCard.b;

      // Serialize → encrypt → return for write
      const serialized = cardDataService.serialize(updatedCard);
      return silentShieldService.encrypt(serialized);
    });

    return { type: 'top-up', balance: newBalance };
  };

  return { execute };
};
