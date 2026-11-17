import { z } from "zod";

const dateSchema = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date.",
  })
  .optional();

export const listOutstandingReportSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    from: dateSchema,
    to: dateSchema,
    export: z.coerce.boolean().optional(),
  }),
});

export const commissionReportSchema = z.object({
  query: z.object({
    paidFrom: dateSchema,
    paidTo: dateSchema,
  }),
});
