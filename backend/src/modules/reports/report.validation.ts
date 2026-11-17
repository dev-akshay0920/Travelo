import { z } from "zod";

export const listOutstandingReportSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export const commissionReportSchema = z.object({
  query: z.object({
    paidFrom: z.string().datetime().optional(),
    paidTo: z.string().datetime().optional(),
  }),
});
