import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const metaWebhookVerifySchema = z.object({
  "hub.mode": z.string().optional(),
  "hub.verify_token": z.string().optional(),
  "hub.challenge": z.string().optional(),
});

export const googleWebhookSchema = z.object({
  agencyId: objectIdSchema,
  lead: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().max(20).optional(),
    message: z.string().trim().max(2000).optional(),
    requestedStartDate: z.string().optional(),
    travelerCount: z.number().int().min(1).max(30).optional(),
    utmSource: z.string().trim().max(100).optional(),
    utmMedium: z.string().trim().max(100).optional(),
    utmCampaign: z.string().trim().max(100).optional(),
  }),
});

export type GoogleWebhookInput = z.infer<typeof googleWebhookSchema>;
