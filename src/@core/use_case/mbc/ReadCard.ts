import type { AwilixRegistry } from '@di/container';
import type { CardData } from '@core/services/mbc/models';

export interface ReadCardUseCaseInterface {
  execute(): Promise<CardData>;
}

export const ReadCardUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): ReadCardUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (): Promise<CardData> => {
    // Step 1: Read card
    const rawEncrypted = await nfcService.readCard();

    // Step 2: Decrypt
    const decrypted = await silentShieldService.decrypt(rawEncrypted);

    // Step 3: Deserialize (includes Zod validation)
    const cardData = cardDataService.deserialize(decrypted);

    // Step 4: Validate card is registered
    if (!cardData.member.name || !cardData.member.memberId) {
      throw new Error('mbc_error_not_registered');
    }

    return cardData;
  };

  return { execute };
};
