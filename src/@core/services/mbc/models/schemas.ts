import { z } from 'zod';

export const CardDataSchema = z.object({
  v: z.literal(2),
  b: z.number().int().min(0).max(999999),
  s: z.union([z.literal(0), z.literal(1)]),
  t: z.string().nullable(),
});

export const TopUpFormSchema = z.object({
  amount: z.number().int().positive(),
});

export type CardDataSchemaType = z.infer<typeof CardDataSchema>;
export type TopUpFormSchemaType = z.infer<typeof TopUpFormSchema>;
