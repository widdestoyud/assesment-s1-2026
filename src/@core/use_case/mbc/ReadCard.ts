import type { AwilixRegistry } from '@di/container';
import type { CardData } from '@src/@core/models/mbc';

export interface ReadCardUseCaseInterface {
  execute(): Promise<CardData>;
}

export const ReadCardUseCase = (
  deps: Pick<
    AwilixRegistry,
    'chipTransferService' | 'cardDataService' | 'silentShieldService'
  >,
): ReadCardUseCaseInterface => {
  const { chipTransferService, cardDataService, silentShieldService } = deps;

  const execute = async (): Promise<CardData> => {
    // Step 1: Read card
    const rawEncrypted = await chipTransferService.readCard();

    // Step 2: Decrypt
    const decrypted = await silentShieldService.decrypt(rawEncrypted);

    // Step 3: Deserialize (includes Zod validation)
    const cardData = cardDataService.deserialize(decrypted);

    return cardData;
  };

  return { execute };
};
