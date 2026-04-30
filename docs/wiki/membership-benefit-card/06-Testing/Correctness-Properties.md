# Correctness Properties

> Covers: Req 5, Req 6, Req 8, Req 10, Req 11, Req 12, Req 13, Req 18, Req 19

## Overview

These 10 formal properties define the correctness guarantees that the MBC system must uphold. Each property is validated through property-based testing using `fast-check`, which generates random valid inputs to prove the property holds universally — not just for specific test cases.

## Property 1: Serialization Round-Trip

For all valid `CardData` objects, serializing then deserializing produces an equivalent object.

```
∀ card ∈ ValidCardData: deserialize(serialize(card)) ≡ card
```

**Covers:** Req 13.4
**Test:** `card-data.service.test.ts`

---

## Property 2: Encryption Round-Trip

For all valid byte arrays, encrypting then decrypting produces the original data.

```
∀ data ∈ Uint8Array: decrypt(encrypt(data)) ≡ data
```

**Covers:** Req 11.4
**Test:** `silent-shield.service.test.ts`

---

## Property 3: Balance Conservation (Top-Up)

After a top-up of amount `a`, the new balance equals the old balance plus `a`.

```
∀ card ∈ ValidCardData, a ∈ PositiveInt:
  applyTopUp(card, a).balance = card.balance + a
```

**Covers:** Req 5.2
**Test:** `card-data.service.test.ts`

---

## Property 4: Balance Conservation (Check-Out)

After a check-out with fee `f`, the new balance equals the old balance minus `f`, and the balance is never negative.

```
∀ card ∈ CheckedInCardData, f ∈ PositiveInt where f ≤ card.balance:
  applyCheckOut(card, f).balance = card.balance - f
  ∧ applyCheckOut(card, f).balance ≥ 0
```

**Covers:** Req 8.6, Req 18.7
**Test:** `card-data.service.test.ts`

---

## Property 5: Exactly-Once Deduction

Applying check-out to an already checked-out card is rejected (no active `CheckInStatus`). This prevents double deduction.

```
∀ card ∈ CheckedInCardData:
  let result1 = applyCheckOut(card, fee)
  applyCheckOut(result1, fee) → rejected (no active CheckInStatus)
```

**Covers:** Req 8.8, Req 18.7
**Test:** `card-data.service.test.ts`

---

## Property 6: Check-In Status Exclusivity

A card with an active `CheckInStatus` cannot be checked in again. A card without an active `CheckInStatus` cannot be checked out.

```
∀ card ∈ CheckedInCardData: applyCheckIn(card, ...) → rejected
∀ card ∈ NotCheckedInCardData: applyCheckOut(card, ...) → rejected
```

**Covers:** Req 6.3, Req 8.8
**Test:** `card-data.service.test.ts`

---

## Property 7: Transaction Log Bounded Size

The transaction log never exceeds 5 entries after any operation.

```
∀ card ∈ ValidCardData, op ∈ {topUp, checkOut}:
  applyOp(card).transactions.length ≤ 5
```

**Covers:** Req 10.2
**Test:** `card-data.service.test.ts`

---

## Property 8: Ceiling Rounding Fare Calculation

For per-hour pricing with ceiling rounding, the fee is always `ceil(hours) × rate`.

```
∀ duration ∈ PositiveDuration, rate ∈ PositiveInt:
  calculateFee('per-hour', 'ceiling', duration, rate) = Math.ceil(duration / 3600) × rate
```

**Covers:** Req 12.1, Req 12.2, Req 12.3
**Test:** `pricing.service.test.ts`

---

## Property 9: Pricing Strategy Consistency

For per-visit and flat-fee pricing, the fee is always exactly `rate_per_unit` regardless of duration.

```
∀ duration ∈ PositiveDuration, rate ∈ PositiveInt:
  calculateFee('per-visit', _, _, rate) = rate
  calculateFee('flat-fee', _, _, rate) = rate
```

**Covers:** Req 12.5, Req 12.6
**Test:** `pricing.service.test.ts`

---

## Property 10: Device Binding Enforcement

A check-out operation succeeds only when the device ID on the card matches the current device's ID.

```
∀ card ∈ CheckedInCardData, currentDeviceId ∈ String:
  card.checkIn.deviceId = currentDeviceId → check-out allowed
  card.checkIn.deviceId ≠ currentDeviceId → check-out rejected
```

**Covers:** Req 19.3, Req 19.4
**Test:** `CheckOut.test.ts`

---

## Summary Table

| # | Property | Service | Req |
|---|----------|---------|-----|
| 1 | Serialization Round-Trip | card-data.service | 13.4 |
| 2 | Encryption Round-Trip | silent-shield.service | 11.4 |
| 3 | Balance Conservation (Top-Up) | card-data.service | 5.2 |
| 4 | Balance Conservation (Check-Out) | card-data.service | 8.6, 18.7 |
| 5 | Exactly-Once Deduction | card-data.service | 8.8, 18.7 |
| 6 | Check-In Status Exclusivity | card-data.service | 6.3, 8.8 |
| 7 | Transaction Log Bounded Size | card-data.service | 10.2 |
| 8 | Ceiling Rounding Fare | pricing.service | 12.1-3 |
| 9 | Pricing Strategy Consistency | pricing.service | 12.5-6 |
| 10 | Device Binding Enforcement | CheckOut use case | 19.3-4 |

## Related Pages

- [Testing Strategy](Testing-Strategy) — Overall testing approach
- [Test Coverage Matrix](Test-Coverage-Matrix) — Requirement → test mapping
- [Card Data Schema](../02-Data-Models/Card-Data-Schema) — Data model for properties 1, 3-7
- [Pricing Engine](../04-Technical-Flows/Pricing-Engine) — Logic for properties 8, 9
- [Device Binding](../04-Technical-Flows/Device-Binding) — Logic for property 10
