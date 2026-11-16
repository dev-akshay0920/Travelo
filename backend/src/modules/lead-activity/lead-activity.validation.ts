import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const createLeadActivitySchema = z
  .object({
    leadId: objectIdSchema,
    type: z.enum([
      "call",
      "email",
      "whatsapp",
      "note",
      "status_change",
      "document",
      "task",
    ]),
    subject: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict();

export const listLeadActivitiesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type CreateLeadActivityInput = z.infer<typeof createLeadActivitySchema>;
export type ListLeadActivitiesQuery = z.infer<typeof listLeadActivitiesQuerySchema>;