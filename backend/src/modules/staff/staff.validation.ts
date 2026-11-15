import { z } from "zod";

export const createStaffSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    role: z.enum(["owner", "admin", "manager", "agent", "accountant", "viewer"]),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    role: z.enum(["owner", "admin", "manager", "agent", "accountant", "viewer"]).optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listStaffSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    role: z.enum(["owner", "admin", "manager", "agent", "accountant", "viewer"]).optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "role", "joinedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const updateStaffRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    role: z.enum(["owner", "admin", "manager", "agent", "accountant", "viewer"]),
  }),
});