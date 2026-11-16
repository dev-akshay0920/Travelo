import { z } from "zod";

const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  accommodation: z.string().max(500).optional(),
  meals: z.array(z.string().max(200)).max(10).optional(),
  transport: z.string().max(500).optional(),
  sightseeing: z.array(z.string().max(200)).max(20).optional(),
  highlights: z.array(z.string().max(200)).max(20).optional(),
  distance: z.string().max(100).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        key: z.string(),
        altText: z.string().max(200).optional(),
      })
    )
    .max(10)
    .optional(),
});

export const createItinerarySchema = z.object({
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    name: z.string().min(1).max(200),
    destination: z.string().min(1).max(200),
    durationDays: z.number().int().min(1).max(365),
    durationNights: z.number().int().min(0).max(364),
    days: z.array(ItineraryDaySchema).max(365).optional(),
    totalPrice: z.number().min(0).optional(),
    currency: z.string().length(3).default("INR"),
    taxType: z.enum(["inclusive", "exclusive", "none"]).default("none"),
    taxPercentage: z.number().min(0).max(100).default(0),
    advancePercentage: z.number().min(0).max(100).default(0),
    isTemplate: z.boolean().default(false),
    templateCategory: z.string().max(100).optional(),
    aiGenerated: z.boolean().default(false),
  }),
});

export const updateItinerarySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    name: z.string().min(1).max(200).optional(),
    destination: z.string().min(1).max(200).optional(),
    durationDays: z.number().int().min(1).max(365).optional(),
    durationNights: z.number().int().min(0).max(364).optional(),
    days: z.array(ItineraryDaySchema).max(365).optional(),
    totalPrice: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    taxType: z.enum(["inclusive", "exclusive", "none"]).optional(),
    taxPercentage: z.number().min(0).max(100).optional(),
    advancePercentage: z.number().min(0).max(100).optional(),
    isTemplate: z.boolean().optional(),
    templateCategory: z.string().max(100).optional(),
    aiGenerated: z.boolean().optional(),
  }),
});

export const getItinerarySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listItinerariesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    isTemplate: z.coerce.boolean().optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "name", "destination"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteItinerarySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const aiGenerateItinerarySchema = z.object({
  body: z.object({
    destination: z.string().trim().min(1).max(200),
    durationDays: z.number().int().min(1).max(30),
    travelerCount: z.number().int().min(1).max(30).optional(),
    budget: z.number().min(0).optional(),
    currency: z.string().length(3).default("INR"),
    style: z.string().trim().max(100).optional(),
    interests: z.array(z.string().trim().max(100)).max(20).optional(),
    notes: z.string().trim().max(2000).optional(),
  }),
});

export const aiGeneratedItineraryDraftSchema = z.object({
  name: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        accommodation: z.string().max(500).optional(),
        meals: z.array(z.string().max(200)).max(10).optional(),
        transport: z.string().max(500).optional(),
        sightseeing: z.array(z.string().max(200)).max(20).optional(),
        highlights: z.array(z.string().max(200)).max(20).optional(),
        distance: z.string().max(100).optional(),
      })
    )
    .min(1)
    .max(30),
  estimatedTotalPrice: z.number().min(0).optional(),
});

export type AiGenerateItineraryInput = z.infer<
  typeof aiGenerateItinerarySchema
>["body"];
export type AiGeneratedItineraryDraft = z.infer<
  typeof aiGeneratedItineraryDraftSchema
>;