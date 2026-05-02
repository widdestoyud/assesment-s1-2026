import fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AwilixRegistry } from '@di/container';
import type { CardData } from '@core/services/mbc/models';

import { CardDataService } from '../../mbc/card-data.service';

const mockContainer: AwilixRegistry = {} as any;

// --- fast-check arbitraries for valid CardData ---

const memberArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  memberId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
});

const isoTimestampArb = fc
  .integer({
    min: new Date('2020-01-01T00:00:00.000Z').getTime(),
    max: new Date('2030-12-31T23:59:59.999Z').getTime(),
  })
  .map(ms => new Date(ms).toISOString());

const benefitTypeIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
  .filter(s => s.length >= 1);

const deviceIdArb = fc
  .stringMatching(/^[a-f0-9-]{1,36}$/)
  .filter(s => s.length >= 1);

const transactionEntryArb = fc.record({
  amount: fc.integer({ min: -1000000, max: 1000000 }),
  timestamp: isoTimestampArb,
  activityType: benefitTypeIdArb,
  benefitTypeId: benefitTypeIdArb,
});

const transactionsArb = fc.array(transactionEntryArb, {
  minLength: 0,
  maxLength: 5,
});

const checkInStatusArb = fc.record({
  timestamp: isoTimestampArb,
  benefitTypeId: benefitTypeIdArb,
  deviceId: deviceIdArb,
});

const cardDataArb: fc.Arbitrary<CardData> = fc.record({
  version: fc.integer({ min: 1, max: 100 }),
  member: memberArb,
  balance: fc.integer({ min: 0, max: 10000000 }),
  checkIn: fc.option(checkInStatusArb, { nil: null }),
  transactions: transactionsArb,
});

// Card with no active check-in (for check-in tests)
const cardNotCheckedInArb: fc.Arbitrary<CardData> = fc.record({
  version: fc.integer({ min: 1, max: 100 }),
  member: memberArb,
  balance: fc.integer({ min: 0, max: 10000000 }),
  checkIn: fc.constant(null),
  transactions: transactionsArb,
});

// Card with active check-in (for check-out tests)
const cardCheckedInArb: fc.Arbitrary<CardData> = fc.record({
  version: fc.integer({ min: 1, max: 100 }),
  member: memberArb,
  balance: fc.integer({ min: 1000, max: 10000000 }),
  checkIn: checkInStatusArb,
  transactions: transactionsArb,
});

describe('CardDataService', () => {
  let service: ReturnType<typeof CardDataService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = CardDataService(mockContainer);
  });

  /**
   * **Validates: Requirements 13.4**
   *
   * Property 1: Serialization Round-Trip
   * For all valid CardData objects, deserialize(serialize(card)) equals card
   */
  describe('Property 1: Serialization Round-Trip', () => {
    it('deserialize(serialize(card)) ≡ card for all valid CardData', () => {
      fc.assert(
        fc.property(cardDataArb, card => {
          const serialized = service.serialize(card);
          const deserialized = service.deserialize(serialized);
          expect(deserialized).toEqual(card);
        }),
        { numRuns: 200 },
      );
    });
  });

  /**
   * **Validates: Requirements 5.2**
   *
   * Property 3: Balance Conservation (Top-Up)
   * For all valid cards and positive amounts, applyTopUp(card, a).balance === card.balance + a
   */
  describe('Property 3: Balance Conservation (Top-Up)', () => {
    it('applyTopUp(card, a).balance === card.balance + a', () => {
      fc.assert(
        fc.property(
          cardDataArb,
          fc.integer({ min: 1, max: 10000000 }),
          (card, amount) => {
            const result = service.applyTopUp(card, amount);
            expect(result.balance).toBe(card.balance + amount);
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * **Validates: Requirements 8.6, 18.7**
   *
   * Property 4: Balance Conservation (Check-Out)
   * For checked-in cards with fee <= balance, applyCheckOut(card, f).balance === card.balance - f
   */
  describe('Property 4: Balance Conservation (Check-Out)', () => {
    it('applyCheckOut(card, f).balance === card.balance - f and balance >= 0', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          isoTimestampArb,
          fc.nat(),
          (card, exitTimestamp, seed) => {
            // Derive fee deterministically from fast-check seed, bounded by balance
            const fee = card.balance > 0 ? seed % (card.balance + 1) : 0;
            const result = service.applyCheckOut(
              card,
              fee,
              'parking-fee',
              'parking',
              exitTimestamp,
            );
            expect(result.balance).toBe(card.balance - fee);
            expect(result.checkIn).toBeNull();
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * **Validates: Requirements 8.8, 18.7**
   *
   * Property 5: Exactly-Once Deduction
   * Applying check-out to an already checked-out card is rejected
   */
  describe('Property 5: Exactly-Once Deduction', () => {
    it('applyCheckOut on already checked-out card throws', () => {
      fc.assert(
        fc.property(
          cardNotCheckedInArb,
          isoTimestampArb,
          (card, exitTimestamp) => {
            expect(() =>
              service.applyCheckOut(
                card,
                100,
                'parking-fee',
                'parking',
                exitTimestamp,
              ),
            ).toThrow('Cannot check out: no active check-in session');
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * **Validates: Requirements 6.3, 8.8**
   *
   * Property 6: Check-In Status Exclusivity
   * A checked-in card cannot be checked in again; a not-checked-in card cannot be checked out
   */
  describe('Property 6: Check-In Status Exclusivity', () => {
    it('applyCheckIn on checked-in card throws', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          isoTimestampArb,
          benefitTypeIdArb,
          deviceIdArb,
          (card, timestamp, benefitTypeId, deviceId) => {
            expect(() =>
              service.applyCheckIn(card, benefitTypeId, deviceId, timestamp),
            ).toThrow(
              'Cannot check in: card already has an active check-in session',
            );
          },
        ),
        { numRuns: 200 },
      );
    });

    it('applyCheckOut on not-checked-in card throws', () => {
      fc.assert(
        fc.property(
          cardNotCheckedInArb,
          isoTimestampArb,
          (card, exitTimestamp) => {
            expect(() =>
              service.applyCheckOut(
                card,
                100,
                'parking-fee',
                'parking',
                exitTimestamp,
              ),
            ).toThrow('Cannot check out: no active check-in session');
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * **Validates: Requirements 10.2**
   *
   * Property 7: Transaction Log Bounded Size
   * After any operation, transactions.length <= 5
   */
  describe('Property 7: Transaction Log Bounded Size', () => {
    it('transactions.length <= 5 after applyTopUp', () => {
      fc.assert(
        fc.property(
          cardDataArb,
          fc.integer({ min: 1, max: 10000000 }),
          (card, amount) => {
            const result = service.applyTopUp(card, amount);
            expect(result.transactions.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('transactions.length <= 5 after applyCheckOut', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          isoTimestampArb,
          (card, exitTimestamp) => {
            const fee = Math.min(100, card.balance);
            const result = service.applyCheckOut(
              card,
              fee,
              'parking-fee',
              'parking',
              exitTimestamp,
            );
            expect(result.transactions.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('transactions.length <= 5 after appendTransactionLog', () => {
      fc.assert(
        fc.property(
          cardDataArb,
          transactionEntryArb,
          (card, entry) => {
            const result = service.appendTransactionLog(card, entry);
            expect(result.transactions.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
