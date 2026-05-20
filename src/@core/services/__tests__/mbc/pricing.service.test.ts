import { beforeEach, describe, expect, it } from 'vitest';

import type { AwilixRegistry } from '@di/container';
import type { PricingStrategy } from '@core/models/mbc';

import { PricingService } from '../../mbc/pricing.service';

const mockContainer: AwilixRegistry = {} as AwilixRegistry;

describe('PricingService', () => {
  let service: ReturnType<typeof PricingService>;

  beforeEach(() => {
    service = PricingService(mockContainer);
  });

  describe('per-visit pricing', () => {
    it('returns flat rate for per-visit', () => {
      const strategy: PricingStrategy = { ratePerUnit: 5000, unitType: 'per-visit', roundingStrategy: 'ceiling' };
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T13:00:00Z');

      expect(result.fee).toBe(5000);
      expect(result.usageUnits).toBe(1);
      expect(result.unitLabel).toBe('kunjungan');
      expect(result.roundingApplied).toBe('none');
    });
  });

  describe('flat-fee pricing', () => {
    it('returns flat rate for flat-fee', () => {
      const strategy: PricingStrategy = { ratePerUnit: 10000, unitType: 'flat-fee', roundingStrategy: 'ceiling' };
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T13:00:00Z');

      expect(result.fee).toBe(10000);
      expect(result.usageUnits).toBe(1);
      expect(result.unitLabel).toBe('flat');
      expect(result.roundingApplied).toBe('none');
    });
  });

  describe('per-hour pricing with ceiling rounding', () => {
    it('rounds up partial hours', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'ceiling' };
      // 2.5 hours → ceil → 3 hours
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:30:00Z');

      expect(result.fee).toBe(6000);
      expect(result.usageUnits).toBe(3);
      expect(result.unitLabel).toBe('jam');
      expect(result.roundingApplied).toBe('ceiling');
    });

    it('exact hours stay the same', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'ceiling' };
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:00:00Z');

      expect(result.fee).toBe(4000);
      expect(result.usageUnits).toBe(2);
    });
  });

  describe('per-hour pricing with floor rounding', () => {
    it('rounds down partial hours', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'floor' };
      // 2.5 hours → floor → 2 hours
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:30:00Z');

      expect(result.fee).toBe(4000);
      expect(result.usageUnits).toBe(2);
      expect(result.roundingApplied).toBe('floor');
    });

    it('rounds down 2.9 hours to 2', () => {
      const strategy: PricingStrategy = { ratePerUnit: 3000, unitType: 'per-hour', roundingStrategy: 'floor' };
      // 2h 54m = 2.9 hours → floor → 2
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:54:00Z');

      expect(result.fee).toBe(6000);
      expect(result.usageUnits).toBe(2);
    });
  });

  describe('per-hour pricing with nearest rounding', () => {
    it('rounds to nearest hour (down when < 0.5)', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'nearest' };
      // 2h 20m = 2.33 hours → round → 2
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:20:00Z');

      expect(result.fee).toBe(4000);
      expect(result.usageUnits).toBe(2);
      expect(result.roundingApplied).toBe('nearest');
    });

    it('rounds to nearest hour (up when >= 0.5)', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'nearest' };
      // 2h 40m = 2.67 hours → round → 3
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T12:40:00Z');

      expect(result.fee).toBe(6000);
      expect(result.usageUnits).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('returns 0 fee when check-in and check-out are the same time', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'floor' };
      const result = service.calculateFee(strategy, '2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z');

      expect(result.fee).toBe(0);
      expect(result.usageUnits).toBe(0);
    });

    it('returns 0 fee when check-out is before check-in (negative diff clamped to 0)', () => {
      const strategy: PricingStrategy = { ratePerUnit: 2000, unitType: 'per-hour', roundingStrategy: 'floor' };
      const result = service.calculateFee(strategy, '2024-01-01T12:00:00Z', '2024-01-01T10:00:00Z');

      expect(result.fee).toBe(0);
      expect(result.usageUnits).toBe(0);
    });
  });
});
