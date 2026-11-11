import { z } from "zod";
import { LEAD_STATUSES } from "./lead.model";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }, "Invalid date.");

export const createLeadSchema = z
  .object({
    agencyId: objectIdSchema,
    packageId: objectIdSchema.optional(),
    message: z.string().trim().min(10).max(2000),
    requestedStartDate: isoDateSchema.optional(),
    travelerCount: z.number().int().min(1).max(30).optional(),
  })
  .strict();

export const listLeadsQuerySchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    packageId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export const updateLeadSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    agencyNote: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine((value) => value.status !== undefined || value.agencyNote !== undefined, {
    message: "Provide a status or agency note to update.",
  });

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
