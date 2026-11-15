import { z } from "zod";

export const createLeadPipelineSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    order: z.number().int().min(0).default(0),
    probability: z.number().min(0).max(100).default(0),
    color: z.string().trim().max(20).default("#6B7280"),
    isDefault: z.boolean().default(false),
    isClosedWon: z.boolean().default(false),
    isClosedLost: z.boolean().default(false),
  })
  .strict();

export const updateLeadPipelineSchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    order: z.number().int().min(0).optional(),
    probability: z.number().min(0).max(100).optional(),
    color: z.string().trim().max(20).optional(),
    isDefault: z.boolean().optional(),
    isClosedWon: z.boolean().optional(),
    isClosedLost: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export const listLeadPipelinesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type CreateLeadPipelineInput = z.infer<typeof createLeadPipelineSchema>;
export type UpdateLeadPipelineInput = z.infer<typeof updateLeadPipelineSchema>;
export type ListLeadPipelinesQuery = z.infer<typeof listLeadPipelinesQuerySchema>;