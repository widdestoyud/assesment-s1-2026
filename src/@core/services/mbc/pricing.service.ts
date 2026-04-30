import type { AwilixRegistry } from '@di/container';
import type { FeeResult, PricingStrategy } from '@core/services/mbc/models';

export interface PricingServiceInterface {
  calculateFee(
    strategy: PricingStrategy,
    checkInTime: string,
    checkOutTime: string,
  ): FeeResult;
}

export const PricingService = (
  _deps: AwilixRegistry,
): PricingServiceInterface => {
  const calculateFee = (
    strategy: PricingStrategy,
    checkInTime: string,
    checkOutTime: string,
  ): FeeResult => {
    const { ratePerUnit, unitType, roundingStrategy } = strategy;

    if (unitType === 'per-visit') {
      return {
        fee: ratePerUnit,
        usageUnits: 1,
        unitLabel: 'kunjungan',
        ratePerUnit,
        roundingApplied: 'none',
      };
    }

    if (unitType === 'flat-fee') {
      return {
        fee: ratePerUnit,
        usageUnits: 1,
        unitLabel: 'flat',
        ratePerUnit,
        roundingApplied: 'none',
      };
    }

    // per-hour calculation
    const diffMs =
      new Date(checkOutTime).getTime() - new Date(checkInTime).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let roundedHours: number;
    switch (roundingStrategy) {
      case 'ceiling':
        roundedHours = Math.ceil(diffHours);
        break;
      case 'floor':
        roundedHours = Math.floor(diffHours);
        break;
      case 'nearest':
        roundedHours = Math.round(diffHours);
        break;
    }

    // Ensure minimum 0 hours
    roundedHours = Math.max(0, roundedHours);

    return {
      fee: roundedHours * ratePerUnit,
      usageUnits: roundedHours,
      unitLabel: 'jam',
      ratePerUnit,
      roundingApplied: roundingStrategy,
    };
  };

  return { calculateFee };
};
