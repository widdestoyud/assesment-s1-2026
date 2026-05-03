import type { AwilixRegistry } from '@di/container';
import type { CheckInResult } from '@core/services/mbc/models';

export interface CheckInInput {
  benefitTypeId: string;
  benefitTypeName: string;
  deviceId: string;
  /** Optional custom timestamp for simulation mode (ISO 8601) */
  simulationTimestamp?: string;
}

export interface CheckInUseCaseInterface {
  execute(input: CheckInInput): Promise<CheckInResult>;
}

export const CheckInUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): CheckInUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (input: CheckInInput): Promise<CheckInResult> => {
    // Step 1: Read card → decrypt → deserialize
    const rawEncrypted = await nfcService.readCard();
    const decrypted = await silentShieldService.decrypt(rawEncrypted);
    const cardData = cardDataService.deserialize(decrypted);

    // Step 2: Validate card is registered
    if (!cardData.member.name || !cardData.member.memberId) {
      throw new Error('mbc_error_not_registered');
    }

    // Step 3: Validate no active check-in (double tap-in prevention)
    if (cardData.checkIn !== null) {
      throw new Error('mbc_error_already_checked_in');
    }

    // Step 4: Determine timestamp (real or simulation)
    const timestamp = input.simulationTimestamp ?? new Date().toISOString();

    // Step 5: Apply check-in
    const updatedCard = cardDataService.applyCheckIn(
      cardData,
      input.benefitTypeId,
      input.deviceId,
      timestamp,
    );

    // Step 6: Serialize → encrypt → write with verify
    const serialized = cardDataService.serialize(updatedCard);
    const encrypted = await silentShieldService.encrypt(serialized);
    const writeResult = await nfcService.writeAndVerify(encrypted);

    if (!writeResult.success) {
      throw new Error('mbc_error_write_verification_failed');
    }

    return {
      memberName: cardData.member.name,
      entryTime: timestamp,
      benefitTypeName: input.benefitTypeName,
    };
  };

  return { execute };
};
