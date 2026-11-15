import { z } from "zod";

const FeatureSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  included: z.boolean().default(true),
});

const LimitsSchema = z.object({
  maxStaff: z.number().int().min(1).default(5),
  maxLeadsPerMonth: z.number().int().min(1).default(100),
  maxBookingsPerMonth: z.number().int().min(1).default(50),
  maxStorageGB: z.number().int().min(1).default(5),
  apiAccess: z.boolean().default(false),
  customBranding: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
});

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).toLowerCase(),
    description: z.string().max(500).optional(),
    priceMonthly: z.number().min(0),
    priceYearly: z.number().min(0),
    currency: z.string().length(3).default("INR"),
    features: z.array(FeatureSchema).optional(),
    limits: LimitsSchema,
    isActive: z.boolean().default(true),
    isPopular: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  }),
});

export const updateSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    priceMonthly: z.number().min(0).optional(),
    priceYearly: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    features: z.array(FeatureSchema).optional(),
    limits: LimitsSchema.optional(),
    isActive: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const getSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listSubscriptionPlansSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "name", "priceMonthly", "sortOrder"]).default("sortOrder"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const deleteSubscriptionPlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});