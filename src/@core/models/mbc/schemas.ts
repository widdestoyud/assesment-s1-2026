import { z } from 'zod';

export const TransactionEntrySchema = z.object({
  ts: z.number().int(),
  a: z.number().int(),
  tp: z.enum(['tu', 'ci', 'co']),
  sim: z.literal(1).optional(),
});

export const CardDataSchema = z.object({
  v: z.literal(2),
  b: z.number().int().min(0).max(999999),
  s: z.union([z.literal(0), z.literal(1)]),
  t: z.string().nullable(),
  m: z.union([z.literal(0), z.literal(1)]).optional(),
  h: z.array(TransactionEntrySchema).max(5).default([]),
});
