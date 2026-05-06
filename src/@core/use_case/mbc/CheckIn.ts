import type { AwilixRegistry } from '@di/container';
import type { CheckInResult } from '@core/services/mbc/models';

export interface CheckInUseCaseInterface {
  execute(): Promise<CheckInResult>;
}

export const CheckInUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): CheckInUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (): Promise<CheckInResult> => {
    let checkInTime = '';

    // Single-tap: read card, validate, apply check-in, write back
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      // Decrypt → deserialize
      const decrypted = await silentShieldService.decrypt(rawEncrypted);
      const card = cardDataService.deserialize(decrypted);

      // Validate not already checked in
      if (card.s !== 0) {
        throw new Error('mbc_error_already_checked_in');
      }

      // Apply check-in with current timestamp
      const timestamp = new Date().toISOString();
      const updatedCard = cardDataService.applyCheckIn(card, timestamp);
      checkInTime = timestamp;

      // Serialize → encrypt → return for write
      const serialized = cardDataService.serialize(updatedCard);
      return silentShieldService.encrypt(serialized);
    });

    return { checkInTime };
  };

  return { execute };
};
