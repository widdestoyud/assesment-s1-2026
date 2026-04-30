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
      throw new Error('Top-up amount must be a positive number');
    }

    // Step 1: Read card → decrypt → deserialize
    const rawEncrypted = await nfcService.readCard();
    const decrypted = silentShieldService.decrypt(rawEncrypted);
    const cardData = cardDataService.deserialize(decrypted);

    // Step 2: Validate card is registered
    if (!cardData.member.name || !cardData.member.memberId) {
      throw new Error('Card is not registered. Please register at The Station first.');
    }

    const previousBalance = cardData.balance;

    // Step 3: Apply top-up (also appends transaction log)
    const updatedCard = cardDataService.applyTopUp(cardData, input.amount);

    // Step 4: Serialize → encrypt → write with verify
    const serialized = cardDataService.serialize(updatedCard);
    const encrypted = silentShieldService.encrypt(serialized);
    const writeResult = await nfcService.writeAndVerify(encrypted);

    if (!writeResult.success) {
      throw new Error(
        `Top-up failed: write verification error — ${writeResult.error}`,
      );
    }

    return {
      type: 'top-up',
      memberName: cardData.member.name,
      previousBalance,
      amount: input.amount,
      newBalance: updatedCard.balance,
    };
  };

  return { execute };
};
