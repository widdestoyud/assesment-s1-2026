# Zod Validation Schemas

> Covers: Req 4, Req 5, Req 12, Req 13, Req 15, Req 21
> Source: `src/@core/services/mbc/models/schemas.ts`

## Overview

All data entering the system is validated with Zod schemas. This includes NFC card data (on deserialization), form inputs, and benefit type configuration.

## CardDataSchema

Validates the complete card data structure on every NFC read.

```typescript
export const CardDataSchema = z.object({
  version: z.number().int().positive(),
  member: z.object({
    name: z.string().min(1).max(50),
    memberId: z.string().min(1).max(20),
  }),
  balance: z.number().int().nonnegative(),
  checkIn: z.object({
    timestamp: z.string().datetime(),
    benefitTypeId: z.string().min(1),
    deviceId: z.string().min(1),
  }).nullable(),
  transactions: z.array(z.object({
    amount: z.number().int(),
    timestamp: z.string().datetime(),
    activityType: z.string().min(1),
    benefitTypeId: z.string().min(1),
  })).max(5),
});
```

| Field | Validation Rule |
|-------|----------------|
| `version` | Positive integer |
| `member.name` | 1-50 characters |
| `member.memberId` | 1-20 characters |
| `balance` | Non-negative integer |
| `checkIn` | Nullable object with datetime + non-empty strings |
| `transactions` | Array of max 5 entries, each with int amount + datetime |

## BenefitTypeFormSchema

Validates benefit type configuration form input (Req 15.2).

```typescript
export const BenefitTypeFormSchema = z.object({
  id: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(50),
  activityType: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/),
  pricing: z.object({
    ratePerUnit: z.number().int().positive(),
    unitType: z.enum(['per-hour', 'per-visit', 'flat-fee']),
    roundingStrategy: z.enum(['ceiling', 'floor', 'nearest']),
  }),
});
```

| Field | Validation Rule |
|-------|----------------|
| `id` | 1-30 chars, lowercase alphanumeric + hyphens only |
| `displayName` | 1-50 characters |
| `activityType` | 1-30 chars, lowercase alphanumeric + hyphens only |
| `pricing.ratePerUnit` | Positive integer (IDR) |
| `pricing.unitType` | One of: `per-hour`, `per-visit`, `flat-fee` |
| `pricing.roundingStrategy` | One of: `ceiling`, `floor`, `nearest` |

## RegistrationFormSchema

Validates member registration form input (Req 4).

```typescript
export const RegistrationFormSchema = z.object({
  name: z.string().min(1).max(50),
  memberId: z.string().min(1).max(20),
});
```

## TopUpFormSchema

Validates top-up amount input (Req 5).

```typescript
export const TopUpFormSchema = z.object({
  amount: z.number().int().positive(),
});
```

## ManualCalcFormSchema

Validates manual calculation form input (Req 21).

```typescript
export const ManualCalcFormSchema = z.object({
  checkInTimestamp: z.string().datetime(),
  benefitTypeId: z.string().min(1),
});
```

## Inferred Types

Each schema exports an inferred TypeScript type:

```typescript
export type CardDataSchemaType = z.infer<typeof CardDataSchema>;
export type BenefitTypeFormSchemaType = z.infer<typeof BenefitTypeFormSchema>;
export type RegistrationFormSchemaType = z.infer<typeof RegistrationFormSchema>;
export type TopUpFormSchemaType = z.infer<typeof TopUpFormSchema>;
export type ManualCalcFormSchemaType = z.infer<typeof ManualCalcFormSchema>;
```

## Usage Pattern

Schemas are used in two contexts:

1. **Deserialization** — `CardDataSchema.safeParse()` validates NFC card data after JSON.parse
2. **Form validation** — React Hook Form + `zodResolver` validates user input in controllers

## Related Pages

- [Card Data Schema](Card-Data-Schema) — The interfaces these schemas validate
- [Benefit Type Model](Benefit-Type-Model) — BenefitType and PricingStrategy
- [NFC Memory Layout](NFC-Card-Memory-Layout) — Where CardDataSchema is used in deserialization
