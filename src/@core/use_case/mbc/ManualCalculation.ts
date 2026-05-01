import type { AwilixRegistry } from '@di/container';
import type { FeeResult } from '@core/services/mbc/models';

export interface ManualCalculationInput {
  checkInTimestamp: string;
  serviceTypeId: string;
}

export interface ManualCalculationUseCaseInterface {
  execute(input: ManualCalculationInput): Promise<FeeResult>;
}

export const ManualCalculationUseCase = (
  deps: Pick<AwilixRegistry, 'pricingService' | 'serviceRegistryService'>,
): ManualCalculationUseCaseInterface => {
  const { pricingService, serviceRegistryService } = deps;

  const execute = async (
    input: ManualCalculationInput,
  ): Promise<FeeResult> => {
    // Step 1: Lookup service type from registry
    const serviceType = await serviceRegistryService.getById(
      input.serviceTypeId,
    );
    if (!serviceType) {
      throw new Error(
        `Service type "${input.serviceTypeId}" not found in registry. ` +
          'Please configure service types at The Station.',
      );
    }

    // Step 2: Validate check-in timestamp
    const checkInDate = new Date(input.checkInTimestamp);
    if (Number.isNaN(checkInDate.getTime())) {
      throw new TypeError('Invalid check-in timestamp format. Expected ISO 8601.');
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
