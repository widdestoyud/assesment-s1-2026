export interface BenefitType {
  id: string;
  displayName: string;
  activityType: string;
  pricing: PricingStrategy;
}

export interface PricingStrategy {
  ratePerUnit: number;
  unitType: 'per-hour' | 'per-visit' | 'flat-fee';
  roundingStrategy: 'ceiling' | 'floor' | 'nearest';
}

export const DEFAULT_PARKING_BENEFIT: BenefitType = {
  id: 'parking',
  displayName: 'Parkir',
  activityType: 'parking-fee',
  pricing: {
    ratePerUnit: 2000,
    unitType: 'per-hour',
    roundingStrategy: 'ceiling',
  },
};
