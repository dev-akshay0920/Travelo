import { z } from "zod";

export const policyTemplateTypeSchema = z.enum(["terms", "cancellation"]);

export const createPolicyTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required.").max(100),
  type: policyTemplateTypeSchema,
  content: z.string().trim().min(1, "Template content is required.").max(5000),
});

export const updatePolicyTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required.").max(100).optional(),
  type: policyTemplateTypeSchema.optional(),
  content: z.string().trim().min(1, "Template content is required.").max(5000).optional(),
});

export const listPolicyTemplatesQuerySchema = z.object({
  type: policyTemplateTypeSchema.optional(),
  search: z.string().trim().max(120).optional(),
});
