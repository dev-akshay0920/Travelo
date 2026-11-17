import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID.");

export const listAgenciesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z
      .enum(["draft", "pending", "approved", "rejected", "suspended"])
      .optional(),
  }),
});

export const getAgencySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateAgencyStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["draft", "pending", "approved", "rejected", "suspended"]),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.enum(["active", "pending", "suspended"]).optional(),
  }),
});

export const createPayoutSchema = z.object({
  body: z.object({
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    amount: z.number().min(0.01),
    currency: z.string().length(3).default("INR"),
    notes: z.string().max(1000).optional(),
  }),
});

export const listPayoutsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(["pending", "paid", "cancelled"]).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["active", "pending", "suspended"]),
  }),
});
