import type { AwilixRegistry } from '@di/container';
import type { FeeResult } from '@core/services/mbc/models';

export interface ManualCalculationInput {
  checkInTimestamp: string;
  benefitTypeId: string;
}

export interface ManualCalculationUseCaseInterface {
  execute(input: ManualCalculationInput): Promise<FeeResult>;
}

export const ManualCalculationUseCase = (
  deps: Pick<AwilixRegistry, 'pricingService' | 'benefitRegistryService'>,
): ManualCalculationUseCaseInterface => {
  const { pricingService, benefitRegistryService } = deps;

  const execute = async (
    input: ManualCalculationInput,
  ): Promise<FeeResult> => {
    // Step 1: Lookup service type from registry
    const serviceType = await benefitRegistryService.getById(
      input.benefitTypeId,
    );
    if (!serviceType) {
      throw new Error('mbc_error_benefit_type_not_found');
    }

    // Step 2: Validate check-in timestamp
    const checkInDate = new Date(input.checkInTimestamp);
    if (Number.isNaN(checkInDate.getTime())) {
      throw new TypeError('mbc_error_invalid_timestamp');
    }

    // Step 3: Calculate fee using current time as check-out
    const checkOutTime = new Date().toISOString();
    const feeResult = pricingService.calculateFee(
      serviceType.pricing,
      input.checkInTimestamp,
      checkOutTime,
    );

    return feeResult;
  };

  return { execute };
};
