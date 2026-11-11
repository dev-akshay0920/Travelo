import { z } from "zod";

export const createLeadSchema = z.object({
  agencyId: z.string().min(1, "Agency ID is required"),
  packageId: z.string().optional(),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message too long"),
  requestedStartDate: z.string().optional(),
  travelerCount: z.coerce.number().int().min(1).max(50).optional(),
  travellerName: z.string().trim().min(1, "Name is required").max(100).optional(),
  travellerEmail: z.string().trim().email("Invalid email").max(120).optional(),
  travellerPhone: z.string().trim().max(20).optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum([
    "new",
    "contacted",
    "qualified",
    "won",
    "closed",
    "archived",
  ] as const).optional(),
  agencyNote: z.string().trim().max(2000, "Note too long").optional(),
});

export const leadListQuerySchema = z.object({
  status: z.enum([
    "new",
    "contacted",
    "qualified",
    "won",
    "closed",
    "archived",
  ] as const).optional(),
  packageId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadListFilters = z.infer<typeof leadListQuerySchema>;