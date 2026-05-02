import { z } from 'zod';

export const CardDataSchema = z.object({
  version: z.number().int().positive(),
  member: z.object({
    name: z.string().min(1).max(50),
    memberId: z.string().min(1).max(20),
  }),
  balance: z.number().int().nonnegative(),
  checkIn: z
    .object({
      timestamp: z.string().datetime(),
      benefitTypeId: z.string().min(1),
      deviceId: z.string().min(1),
    })
    .nullable(),
  transactions: z
    .array(
      z.object({
        amount: z.number().int(),
        timestamp: z.string().datetime(),
        activityType: z.string().min(1),
        benefitTypeId: z.string().min(1),
      }),
    )
    .max(5),
});

export const BenefitTypeFormSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(50),
  activityType: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
  pricing: z.object({
    ratePerUnit: z.number().int().positive(),
    unitType: z.enum(['per-hour', 'per-visit', 'flat-fee']),
    roundingStrategy: z.enum(['ceiling', 'floor', 'nearest']),
  }),
});

export const RegistrationFormSchema = z.object({
  name: z.string().min(1).max(50),
  memberId: z.string().min(1).max(20),
});

export const TopUpFormSchema = z.object({
  amount: z.number().int().positive(),
});

export const ManualCalcFormSchema = z.object({
  checkInTimestamp: z.string().datetime(),
  benefitTypeId: z.string().min(1),
});

export type CardDataSchemaType = z.infer<typeof CardDataSchema>;
export type BenefitTypeFormSchemaType = z.infer<typeof BenefitTypeFormSchema>;
export type RegistrationFormSchemaType = z.infer<typeof RegistrationFormSchema>;
export type TopUpFormSchemaType = z.infer<typeof TopUpFormSchema>;
export type ManualCalcFormSchemaType = z.infer<typeof ManualCalcFormSchema>;
