import type { AwilixRegistry } from '@di/container';
import type { OperationResult } from '@core/services/mbc/models';

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
    if (input.amount <= 0) {
      throw new Error('mbc_error_topup_amount_invalid');
    }

    let newBalance = 0;

    // Single-tap: read card, process, write back
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      // Decrypt → deserialize
      const decrypted = await silentShieldService.decrypt(rawEncrypted);
      const card = cardDataService.deserialize(decrypted);

      // Validate max balance
      if (card.b + input.amount > 999999) {
        throw new Error('mbc_error_balance_exceeds_max');
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
