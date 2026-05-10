import type { AwilixRegistry } from '@di/container';
import type { OperationResult } from '@src/@core/models/mbc';

export interface ValidateCardUseCaseInterface {
  execute(): Promise<OperationResult>;
}

export const ValidateCardUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): ValidateCardUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (): Promise<OperationResult> => {
    let result: OperationResult = { type: 'new', balance: 0 };

    // Single-tap: read card, validate, and if invalid overwrite with blank
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      try {
        // Try decrypt + deserialize
        const decrypted = await silentShieldService.decrypt(rawEncrypted);
        const card = cardDataService.deserialize(decrypted);

        // Valid card — return same data (no-op write)
        result = { type: 'existing', balance: card.b };
        return rawEncrypted; // Write back the same encrypted data
      } catch {
        // Invalid card — write blank card
        const blankCard = cardDataService.createBlank();
        const serialized = cardDataService.serialize(blankCard);
        const encrypted = await silentShieldService.encrypt(serialized);
        result = { type: 'new', balance: 0 };
        return encrypted;
      }
    });

    return result;
  };

  return { execute };
};
