import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    type: z.enum(["call", "email", "meeting", "follow_up", "document", "payment", "booking", "other"]).default("other"),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    dueAt: z.string().datetime().optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    reminderAt: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    type: z.enum(["call", "email", "meeting", "follow_up", "document", "payment", "booking", "other"]).optional(),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueAt: z.string().datetime().optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    reminderAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    type: z.enum(["call", "email", "meeting", "follow_up", "document", "payment", "booking", "other"]).optional(),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    dueFrom: z.string().datetime().optional(),
    dueTo: z.string().datetime().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "dueAt", "priority", "status"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  }),
});