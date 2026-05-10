import type { AwilixRegistry } from '@di/container';
import type { CheckInResult } from '@src/@core/models/mbc';

export interface CheckInOptions {
  /** Custom timestamp for simulation mode (must be in the past) */
  simulationTimestamp?: string;
}

export interface CheckInUseCaseInterface {
  execute(options?: CheckInOptions): Promise<CheckInResult>;
}

export const CheckInUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService'
  >,
): CheckInUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService } = deps;

  const execute = async (options?: CheckInOptions): Promise<CheckInResult> => {
    let checkInTime = '';
    const isSimulation = Boolean(options?.simulationTimestamp);

    // Validate simulation timestamp is in the past
    if (options?.simulationTimestamp) {
      const simTime = new Date(options.simulationTimestamp).getTime();
      if (simTime > Date.now()) {
        throw new Error('mbc_error_simulation_future_time');
      }
    }

    // Single-tap: read card, validate, apply check-in, write back
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      // Decrypt → deserialize
      const decrypted = await silentShieldService.decrypt(rawEncrypted);
      const card = cardDataService.deserialize(decrypted);

      // Validate not already checked in
      if (card.s !== 0) {
        throw new Error('mbc_error_already_checked_in');
      }

      // Apply check-in with current or simulation timestamp
      const timestamp = options?.simulationTimestamp ?? new Date().toISOString();
      const updatedCard = cardDataService.applyCheckIn(card, timestamp, isSimulation);
      checkInTime = timestamp;

      // Serialize → encrypt → return for write
      const serialized = cardDataService.serialize(updatedCard);
      return silentShieldService.encrypt(serialized);
    });

    return { checkInTime, isSimulation };
  };

  return { execute };
};
