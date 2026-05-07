import { z } from 'zod';

export const TransactionEntrySchema = z.object({
  ts: z.number().int(),
  a: z.number().int(),
  tp: z.enum(['tu', 'ci', 'co']),
});

export const CardDataSchema = z.object({
  v: z.literal(2),
  b: z.number().int().min(0).max(999999),
  s: z.union([z.literal(0), z.literal(1)]),
  t: z.string().nullable(),
  h: z.array(TransactionEntrySchema).max(5).default([]),
});

export const TopUpFormSchema = z.object({
  amount: z.number().int().positive(),
});

export type CardDataSchemaType = z.infer<typeof CardDataSchema>;
export type TopUpFormSchemaType = z.infer<typeof TopUpFormSchema>;
