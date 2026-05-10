import type { AwilixRegistry } from '@di/container';
import type { CheckOutResult } from '@core/services/mbc/models';
import { DEFAULT_PARKING_BENEFIT } from '@core/services/mbc/models';
import { formatDuration } from '@utils/helpers/mbc.helper';

export interface CheckOutUseCaseInterface {
  execute(): Promise<CheckOutResult>;
}

export const CheckOutUseCase = (
  deps: Pick<
    AwilixRegistry,
    'nfcService' | 'cardDataService' | 'silentShieldService' | 'pricingService'
  >,
): CheckOutUseCaseInterface => {
  const { nfcService, cardDataService, silentShieldService, pricingService } =
    deps;

  const execute = async (): Promise<CheckOutResult> => {
    let result: CheckOutResult | null = null;

    // Single-tap: read card, validate, calculate fee, apply check-out, write back
    await nfcService.readThenWrite(async (rawEncrypted: Uint8Array) => {
      // Decrypt → deserialize
      const decrypted = await silentShieldService.decrypt(rawEncrypted);
      const card = cardDataService.deserialize(decrypted);

      // Validate active check-in exists
      if (card.s !== 1 || card.t === null) {
        throw new Error('mbc_error_not_checked_in');
      }

      const isSimulation = card.m === 1;

      // Calculate fee using hardcoded parking config
      const exitTime = new Date().toISOString();
      const feeResult = pricingService.calculateFee(
        DEFAULT_PARKING_BENEFIT.pricing,
        card.t,
        exitTime,
      );

      // Calculate duration for display
      const duration = formatDuration(card.t, exitTime);

      if (isSimulation) {
        // Simulation: clear check-in status WITHOUT deducting balance or recording transaction
        const updatedCard = cardDataService.applySimulationCheckOut(card);

        result = {
          fee: feeResult.fee,
          duration,
          remainingBalance: updatedCard.b,
          feeBreakdown: feeResult,
          isSimulation: true,
        };

        // Serialize → encrypt → return for write
        const serialized = cardDataService.serialize(updatedCard);
        return silentShieldService.encrypt(serialized);
      }

      // Normal flow: validate sufficient balance
      if (feeResult.fee > card.b) {
        throw new Error('mbc_error_insufficient_balance');
      }

      // Apply check-out (deduct fee, clear status, record transaction)
      const updatedCard = cardDataService.applyCheckOut(card, feeResult.fee);

      result = {
        fee: feeResult.fee,
        duration,
        remainingBalance: updatedCard.b,
        feeBreakdown: feeResult,
        isSimulation: false,
      };

      // Serialize → encrypt → return for write
      const serialized = cardDataService.serialize(updatedCard);
      return silentShieldService.encrypt(serialized);
    });

    return result as unknown as CheckOutResult;
  };

  return { execute };
};
