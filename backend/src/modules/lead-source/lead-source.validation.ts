import { z } from "zod";

export const createLeadSourceSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    utmSource: z.string().trim().max(100).optional(),
    utmMedium: z.string().trim().max(100).optional(),
    utmCampaign: z.string().trim().max(100).optional(),
    costPerLead: z.number().nonnegative().optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateLeadSourceSchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    utmSource: z.string().trim().max(100).optional(),
    utmMedium: z.string().trim().max(100).optional(),
    utmCampaign: z.string().trim().max(100).optional(),
    costPerLead: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export const listLeadSourcesQuerySchema = z
  .object({
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type CreateLeadSourceInput = z.infer<typeof createLeadSourceSchema>;
export type UpdateLeadSourceInput = z.infer<typeof updateLeadSourceSchema>;
export type ListLeadSourcesQuery = z.infer<typeof listLeadSourcesQuerySchema>;