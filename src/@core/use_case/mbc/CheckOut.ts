import type { AwilixRegistry } from '@di/container';
import type { CheckOutResult } from '@core/services/mbc/models';
import { formatDuration } from '@utils/helpers/mbc.helper';

export interface CheckOutInput {
  currentDeviceId: string;
}

export interface CheckOutUseCaseInterface {
  execute(input: CheckOutInput): Promise<CheckOutResult>;
}

export const CheckOutUseCase = (
  deps: Pick<
    AwilixRegistry,
    | 'nfcService'
    | 'cardDataService'
    | 'silentShieldService'
    | 'pricingService'
    | 'benefitRegistryService'
  >,
): CheckOutUseCaseInterface => {
  const {
    nfcService,
    cardDataService,
    silentShieldService,
    pricingService,
    benefitRegistryService,
  } = deps;

  const execute = async (input: CheckOutInput): Promise<CheckOutResult> => {
    // Step 1: Read card → decrypt → deserialize
    const rawEncrypted = await nfcService.readCard();
    const decrypted = await silentShieldService.decrypt(rawEncrypted);
    const cardData = cardDataService.deserialize(decrypted);

    // Step 2: Validate active check-in exists (double tap-out prevention)
    if (cardData.checkIn === null) {
      throw new Error(
        'Member has not checked in. Cannot process check-out without an active check-in session.',
      );
    }

    // Step 3: Validate device ID match
    if (cardData.checkIn.deviceId !== input.currentDeviceId) {
      throw new Error(
        'Device mismatch. This member checked in on a different device. ' +
          'Please return to the original check-in device to process check-out.',
      );
    }

    // Step 4: Lookup service type from registry
    const serviceType = await benefitRegistryService.getById(
      cardData.checkIn.benefitTypeId,
    );
    if (!serviceType) {
      throw new Error(
        `Service type "${cardData.checkIn.benefitTypeId}" not found in registry. ` +
          'Please reconfigure service types at The Station.',
      );
    }

    // Step 5: Calculate fee
    const exitTime = new Date().toISOString();
    const feeResult = pricingService.calculateFee(
      serviceType.pricing,
      cardData.checkIn.timestamp,
      exitTime,
    );

    // Step 6: Validate sufficient balance
    if (feeResult.fee > cardData.balance) {
      const shortage = feeResult.fee - cardData.balance;
      throw new Error(
        `Insufficient balance. Fee: Rp ${feeResult.fee.toLocaleString('id-ID')}, ` +
          `Balance: Rp ${cardData.balance.toLocaleString('id-ID')}, ` +
          `Shortage: Rp ${shortage.toLocaleString('id-ID')}. ` +
          'Please top-up at The Station.',
      );
    }

    // Step 7: Snapshot current state (for potential rollback)
    const snapshot = cardDataService.serialize(cardData);

    // Step 8: Apply check-out (deduct fee, clear check-in, append transaction log)
    const updatedCard = cardDataService.applyCheckOut(
      cardData,
      feeResult.fee,
      serviceType.activityType,
      serviceType.id,
      exitTime,
    );

    // Step 9: Serialize → encrypt → write with verify
    const serialized = cardDataService.serialize(updatedCard);
    const encrypted = await silentShieldService.encrypt(serialized);
    const writeResult = await nfcService.writeAndVerify(encrypted);

    if (!writeResult.success) {
      // Attempt rollback: restore snapshot
      try {
        const snapshotEncrypted = await silentShieldService.encrypt(snapshot);
        await nfcService.writeCard(snapshotEncrypted);
      } catch {
        // Rollback failed — card may be in inconsistent state
        throw new Error(
          'CRITICAL: Check-out write failed AND rollback failed. ' +
            'Card may be in an inconsistent state. Please contact support.',
        );
      }
      throw new Error(
        `Check-out failed: write verification error — ${writeResult.error}. ` +
          'Card has been rolled back to pre-checkout state.',
      );
    }

    // Step 10: Calculate duration for display
    const duration = formatDuration(cardData.checkIn.timestamp, exitTime);

    return {
      benefitTypeName: serviceType.displayName,
      entryTime: cardData.checkIn.timestamp,
      exitTime,
      duration,
      fee: feeResult.fee,
      remainingBalance: updatedCard.balance,
      feeBreakdown: feeResult,
    };
  };

  return { execute };
};
