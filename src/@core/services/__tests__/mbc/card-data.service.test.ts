import fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AwilixRegistry } from '@di/container';
import type { CardData, TransactionEntry } from '@core/models/mbc';

import { CardDataService } from '../../mbc/card-data.service';

const mockContainer: AwilixRegistry = {} as AwilixRegistry;

// --- fast-check arbitraries for valid CardData (new schema v2) ---

const transactionTypeArb = fc.constantFrom('tu', 'ci', 'co') as fc.Arbitrary<'tu' | 'ci' | 'co'>;

const transactionEntryArb: fc.Arbitrary<TransactionEntry> = fc.record({
  ts: fc.integer({ min: 1577836800, max: 1924991999 }), // 2020-01-01 to 2030-12-31 epoch seconds
  a: fc.integer({ min: -999999, max: 999999 }),
  tp: transactionTypeArb,
});

const historyArb = fc.array(transactionEntryArb, { minLength: 0, maxLength: 5 });

const isoTimestampArb = fc
  .integer({
    min: new Date('2020-01-01T00:00:00.000Z').getTime(),
    max: new Date('2030-12-31T23:59:59.999Z').getTime(),
  })
  .map(ms => new Date(ms).toISOString());

const cardDataArb: fc.Arbitrary<CardData> = fc.record({
  v: fc.constant(2) as fc.Arbitrary<2>,
  b: fc.integer({ min: 0, max: 999999 }),
  s: fc.constantFrom(0, 1) as fc.Arbitrary<0 | 1>,
  t: fc.option(isoTimestampArb, { nil: null }),
  h: historyArb,
});

// Card with no active check-in (s=0, t=null)
const cardNotCheckedInArb: fc.Arbitrary<CardData> = fc.record({
  v: fc.constant(2) as fc.Arbitrary<2>,
  b: fc.integer({ min: 0, max: 999999 }),
  s: fc.constant(0) as fc.Arbitrary<0>,
  t: fc.constant(null),
  h: historyArb,
});

// Card with active check-in (s=1, t=timestamp)
const cardCheckedInArb: fc.Arbitrary<CardData> = fc.record({
  v: fc.constant(2) as fc.Arbitrary<2>,
  b: fc.integer({ min: 1000, max: 999999 }),
  s: fc.constant(1) as fc.Arbitrary<1>,
  t: isoTimestampArb,
  h: historyArb,
});

describe('CardDataService', () => {
  let service: ReturnType<typeof CardDataService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = CardDataService(mockContainer);
  });

  describe('createBlank', () => {
    it('returns a blank card with correct defaults', () => {
      const blank = service.createBlank();
      expect(blank).toEqual({ v: 2, b: 0, s: 0, t: null, h: [] });
    });
  });

  /**
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
   * Property 3: Balance Conservation (Top-Up)
   * For all valid cards and positive amounts, applyTopUp(card, a).b === card.b + a
   */
  describe('Property 3: Balance Conservation (Top-Up)', () => {
    it('applyTopUp(card, a).b === card.b + a', () => {
      fc.assert(
        fc.property(
          cardDataArb,
          fc.integer({ min: 1, max: 999999 }),
          (card, amount) => {
            const result = service.applyTopUp(card, amount);
            expect(result.b).toBe(card.b + amount);
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * Property 4: Balance Conservation (Check-Out)
   * For checked-in cards with fee <= balance, applyCheckOut(card, f).b === card.b - f
   */
  describe('Property 4: Balance Conservation (Check-Out)', () => {
    it('applyCheckOut(card, f).b === card.b - f and s === 0', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          fc.nat(),
          (card, seed) => {
            const fee = card.b > 0 ? seed % (card.b + 1) : 0;
            const result = service.applyCheckOut(card, fee);
            expect(result.b).toBe(card.b - fee);
            expect(result.s).toBe(0);
            expect(result.t).toBeNull();
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * Property 5: Exactly-Once Deduction
   * Applying check-out to an already checked-out card is rejected
   */
  describe('Property 5: Exactly-Once Deduction', () => {
    it('applyCheckOut on not-checked-in card throws', () => {
      fc.assert(
        fc.property(
          cardNotCheckedInArb,
          (card) => {
            expect(() =>
              service.applyCheckOut(card, 100),
            ).toThrow('mbc_error_not_checked_in');
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * Property 6: Check-In Status Exclusivity
   * A checked-in card cannot be checked in again; a not-checked-in card cannot be checked out
   */
  describe('Property 6: Check-In Status Exclusivity', () => {
    it('applyCheckIn on checked-in card throws', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          isoTimestampArb,
          (card, timestamp) => {
            expect(() =>
              service.applyCheckIn(card, timestamp),
            ).toThrow('mbc_error_already_checked_in');
          },
        ),
        { numRuns: 200 },
      );
    });

    it('applyCheckOut on not-checked-in card throws', () => {
      fc.assert(
        fc.property(
          cardNotCheckedInArb,
          (card) => {
            expect(() =>
              service.applyCheckOut(card, 100),
            ).toThrow('mbc_error_not_checked_in');
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  /**
   * Property 7: Transaction Log Bounded Size
   * After any operation, h.length <= 5
   */
  describe('Property 7: Transaction Log Bounded Size', () => {
    it('h.length <= 5 after applyTopUp', () => {
      fc.assert(
        fc.property(
          cardDataArb,
          fc.integer({ min: 1, max: 999999 }),
          (card, amount) => {
            const result = service.applyTopUp(card, amount);
            expect(result.h.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('h.length <= 5 after applyCheckIn', () => {
      fc.assert(
        fc.property(
          cardNotCheckedInArb,
          isoTimestampArb,
          (card, timestamp) => {
            const result = service.applyCheckIn(card, timestamp);
            expect(result.h.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('h.length <= 5 after applyCheckOut', () => {
      fc.assert(
        fc.property(
          cardCheckedInArb,
          (card) => {
            const fee = Math.min(100, card.b);
            const result = service.applyCheckOut(card, fee);
            expect(result.h.length).toBeLessThanOrEqual(5);
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('applyCheckIn', () => {
    it('sets s=1 and t=timestamp', () => {
      const card: CardData = { v: 2, b: 5000, s: 0, t: null, h: [] };
      const timestamp = '2024-06-15T08:00:00.000Z';
      const result = service.applyCheckIn(card, timestamp);

      expect(result.s).toBe(1);
      expect(result.t).toBe(timestamp);
    });

    it('adds a ci history entry', () => {
      const card: CardData = { v: 2, b: 5000, s: 0, t: null, h: [] };
      const timestamp = '2024-06-15T08:00:00.000Z';
      const result = service.applyCheckIn(card, timestamp);

      expect(result.h.length).toBe(1);
      expect(result.h[0].tp).toBe('ci');
      expect(result.h[0].a).toBe(0);
    });
  });

  describe('applyCheckOut', () => {
    it('sets s=0, t=null, and deducts fee', () => {
      const card: CardData = { v: 2, b: 10000, s: 1, t: '2024-01-01T10:00:00.000Z', h: [] };
      const result = service.applyCheckOut(card, 3000);

      expect(result.s).toBe(0);
      expect(result.t).toBeNull();
      expect(result.b).toBe(7000);
    });

    it('adds a co history entry with negative amount', () => {
      const card: CardData = { v: 2, b: 10000, s: 1, t: '2024-01-01T10:00:00.000Z', h: [] };
      const result = service.applyCheckOut(card, 3000);

      expect(result.h.length).toBe(1);
      expect(result.h[0].tp).toBe('co');
      expect(result.h[0].a).toBe(-3000);
    });
  });

  describe('applyTopUp', () => {
    it('adds amount to balance', () => {
      const card: CardData = { v: 2, b: 5000, s: 0, t: null, h: [] };
      const result = service.applyTopUp(card, 10000);

      expect(result.b).toBe(15000);
    });

    it('adds a tu history entry', () => {
      const card: CardData = { v: 2, b: 5000, s: 0, t: null, h: [] };
      const result = service.applyTopUp(card, 10000);

      expect(result.h.length).toBe(1);
      expect(result.h[0].tp).toBe('tu');
      expect(result.h[0].a).toBe(10000);
    });
  });

  describe('deserialize error handling', () => {
    it('throws on invalid JSON', () => {
      const invalidBytes = new TextEncoder().encode('not json');
      expect(() => service.deserialize(invalidBytes)).toThrow('mbc_nfc_error_card_not_recognized');
    });

    it('throws on invalid schema', () => {
      const invalidCard = new TextEncoder().encode(JSON.stringify({ v: 1, b: 'abc' }));
      expect(() => service.deserialize(invalidCard)).toThrow('mbc_nfc_error_card_data_corrupted');
    });
  });
});
