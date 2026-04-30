import fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AwilixRegistry } from '@di/container';
import type { PricingStrategy } from '@core/services/mbc/models';

import { PricingService } from '../../mbc/pricing.service';

const mockContainer: AwilixRegistry = {} as any;

describe('PricingService', () => {
  let service: ReturnType<typeof PricingService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = PricingService(mockContainer);
  });

  /**
   * **Validates: Requirements 12.1, 12.2, 12.3**
   *
   * Property 8: Ceiling Rounding Fare Calculation
   * For per-hour pricing with ceiling rounding, fee = Math.ceil(hours) × rate
   */
  describe('Property 8: Ceiling Rounding Fare Calculation', () => {
    it('fee equals Math.ceil(hours) × rate for arbitrary durations and rates', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 86400 * 7 }), // duration in seconds (up to 7 days)
          fc.integer({ min: 1, max: 1000000 }), // rate per unit
          (durationSeconds, rate) => {
            const baseTime = new Date('2024-01-01T00:00:00.000Z');
            const checkInTime = baseTime.toISOString();
            const checkOutTime = new Date(
              baseTime.getTime() + durationSeconds * 1000,
            ).toISOString();

            const strategy: PricingStrategy = {
              ratePerUnit: rate,
              unitType: 'per-hour',
              roundingStrategy: 'ceiling',
            };

            const result = service.calculateFee(
              strategy,
              checkInTime,
              checkOutTime,
            );
            const expectedHours = Math.ceil(durationSeconds / 3600);

            expect(result.fee).toBe(expectedHours * rate);
            expect(result.usageUnits).toBe(expectedHours);
            expect(result.unitLabel).toBe('jam');
            expect(result.ratePerUnit).toBe(rate);
            expect(result.roundingApplied).toBe('ceiling');
          },
        ),
        { numRuns: 200 },
      );
    });

    it('exact hour boundaries: exactly 1h, 2h, 3h → fee = hours × rate', () => {
      const rate = 2000;
      const strategy: PricingStrategy = {
        ratePerUnit: rate,
        unitType: 'per-hour',
        roundingStrategy: 'ceiling',
      };

      for (const hours of [1, 2, 3]) {
        const baseTime = new Date('2024-01-01T00:00:00.000Z');
        const checkOutTime = new Date(
          baseTime.getTime() + hours * 3600 * 1000,
        ).toISOString();

        const result = service.calculateFee(
          strategy,
          baseTime.toISOString(),
          checkOutTime,
        );
        expect(result.fee).toBe(hours * rate);
        expect(result.usageUnits).toBe(hours);
      }
    });

    it('just over boundary: 1h + 1s → 2 × rate', () => {
      const rate = 2000;
      const strategy: PricingStrategy = {
        ratePerUnit: rate,
        unitType: 'per-hour',
        roundingStrategy: 'ceiling',
      };

      const baseTime = new Date('2024-01-01T00:00:00.000Z');
      const checkOutTime = new Date(
        baseTime.getTime() + (3600 + 1) * 1000,
      ).toISOString();

      const result = service.calculateFee(
        strategy,
        baseTime.toISOString(),
        checkOutTime,
      );
      expect(result.fee).toBe(2 * rate);
      expect(result.usageUnits).toBe(2);
    });

    it('KDX example: 1h 5m 1s → 2 × 2000 = 4000', () => {
      const strategy: PricingStrategy = {
        ratePerUnit: 2000,
        unitType: 'per-hour',
        roundingStrategy: 'ceiling',
      };

      const baseTime = new Date('2024-01-01T00:00:00.000Z');
      const durationSeconds = 1 * 3600 + 5 * 60 + 1; // 1h 5m 1s
      const checkOutTime = new Date(
        baseTime.getTime() + durationSeconds * 1000,
      ).toISOString();

      const result = service.calculateFee(
        strategy,
        baseTime.toISOString(),
        checkOutTime,
      );
      expect(result.fee).toBe(4000);
      expect(result.usageUnits).toBe(2);
    });
  });

  /**
   * **Validates: Requirements 12.5, 12.6**
   *
   * Property 9: Pricing Strategy Consistency
   * For per-visit and flat-fee pricing, fee always equals ratePerUnit regardless of duration
   */
  describe('Property 9: Pricing Strategy Consistency', () => {
    it('per-visit: fee always equals ratePerUnit regardless of duration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 86400 * 7 }), // arbitrary duration in seconds
          fc.integer({ min: 1, max: 1000000 }), // arbitrary rate
          (durationSeconds, rate) => {
            const baseTime = new Date('2024-01-01T00:00:00.000Z');
            const checkInTime = baseTime.toISOString();
            const checkOutTime = new Date(
              baseTime.getTime() + durationSeconds * 1000,
            ).toISOString();

            const strategy: PricingStrategy = {
              ratePerUnit: rate,
              unitType: 'per-visit',
              roundingStrategy: 'ceiling',
            };

            const result = service.calculateFee(
              strategy,
              checkInTime,
              checkOutTime,
            );

            expect(result.fee).toBe(rate);
            expect(result.usageUnits).toBe(1);
            expect(result.unitLabel).toBe('kunjungan');
            expect(result.roundingApplied).toBe('none');
          },
        ),
        { numRuns: 200 },
      );
    });

    it('flat-fee: fee always equals ratePerUnit regardless of duration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 86400 * 7 }), // arbitrary duration in seconds
          fc.integer({ min: 1, max: 1000000 }), // arbitrary rate
          (durationSeconds, rate) => {
            const baseTime = new Date('2024-01-01T00:00:00.000Z');
            const checkInTime = baseTime.toISOString();
            const checkOutTime = new Date(
              baseTime.getTime() + durationSeconds * 1000,
            ).toISOString();

            const strategy: PricingStrategy = {
              ratePerUnit: rate,
              unitType: 'flat-fee',
              roundingStrategy: 'ceiling',
            };

            const result = service.calculateFee(
              strategy,
              checkInTime,
              checkOutTime,
            );

            expect(result.fee).toBe(rate);
            expect(result.usageUnits).toBe(1);
            expect(result.unitLabel).toBe('flat');
            expect(result.roundingApplied).toBe('none');
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
