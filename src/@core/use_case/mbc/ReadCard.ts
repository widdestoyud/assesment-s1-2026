import type { AwilixRegistry } from '@di/container';
import type { CardData } from '@src/@core/models/mbc';

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

    return cardData;
  };

  return { execute };
};
