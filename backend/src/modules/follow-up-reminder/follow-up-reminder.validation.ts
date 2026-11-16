import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");
const isoDateTimeSchema = z.string().datetime("Use a valid ISO datetime string.");

export const createFollowUpReminderSchema = z
  .object({
    leadId: objectIdSchema,
    staffId: objectIdSchema.optional(),
    reminderAt: isoDateTimeSchema,
    title: z.string().trim().min(1).max(200),
    notes: z.string().trim().max(1000).optional(),
    channel: z.enum(["phone", "email", "whatsapp", "meeting"]),
  })
  .strict();

export const updateFollowUpReminderSchema = z
  .object({
    reminderAt: isoDateTimeSchema.optional(),
    title: z.string().trim().min(1).max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
    isCompleted: z.boolean().optional(),
    channel: z.enum(["phone", "email", "whatsapp", "meeting"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export const listFollowUpRemindersQuerySchema = z
  .object({
    isCompleted: z.coerce.boolean().optional(),
    staffId: objectIdSchema.optional(),
    reminderFrom: isoDateTimeSchema.optional(),
    reminderTo: isoDateTimeSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type CreateFollowUpReminderInput = z.infer<typeof createFollowUpReminderSchema>;
export type UpdateFollowUpReminderInput = z.infer<typeof updateFollowUpReminderSchema>;
export type ListFollowUpRemindersQuery = z.infer<typeof listFollowUpRemindersQuerySchema>;