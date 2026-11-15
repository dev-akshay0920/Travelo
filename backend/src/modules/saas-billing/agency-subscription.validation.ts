import { z } from "zod";

export const createAgencySubscriptionSchema = z.object({
  body: z.object({
    agencyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    planId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
    trialDays: z.number().int().min(0).max(365).default(14),
    paymentMethod: z.enum(["razorpay", "stripe", "bank_transfer", "manual"]).optional(),
    autoRenew: z.boolean().default(true),
  }),
});

export const updateAgencySubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    planId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
    status: z.enum(["trial", "active", "past_due", "cancelled", "expired"]).optional(),
    paymentMethod: z.enum(["razorpay", "stripe", "bank_transfer", "manual"]).optional(),
    paymentMethodDetails: z.record(z.string(), z.unknown()).optional(),
    autoRenew: z.boolean().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
    nextBillingAt: z.string().datetime().optional(),
  }),
});

export const getAgencySubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listAgencySubscriptionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.enum(["trial", "active", "past_due", "cancelled", "expired"]).optional(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "currentPeriodEnd", "nextBillingAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteAgencySubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    cancelAtPeriodEnd: z.boolean().optional(),
  }),
});

export const reactivateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({}).optional(),
});