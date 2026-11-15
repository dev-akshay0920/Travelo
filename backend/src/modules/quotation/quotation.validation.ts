import { z } from "zod";

export const createQuotationSchema = z.object({
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    itineraryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(["draft", "sent", "viewed", "accepted", "expired", "converted"]).default("draft"),
    subtotal: z.number().min(0),
    taxAmount: z.number().min(0).default(0),
    discountAmount: z.number().min(0).default(0),
    total: z.number().min(0),
    currency: z.string().length(3).default("INR"),
    validUntil: z.string().datetime(),
    notes: z.string().max(5000).optional(),
    termsAndConditions: z.string().max(10000).optional(),
  }),
});

export const updateQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    itineraryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(["draft", "sent", "viewed", "accepted", "expired", "converted"]).optional(),
    subtotal: z.number().min(0).optional(),
    taxAmount: z.number().min(0).optional(),
    discountAmount: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    validUntil: z.string().datetime().optional(),
    pdfUrl: z.string().url().optional(),
    pdfKey: z.string().optional(),
    publicShareLink: z.string().optional(),
    shareLinkExpiresAt: z.string().datetime().optional(),
    notes: z.string().max(5000).optional(),
    termsAndConditions: z.string().max(10000).optional(),
  }),
});

export const getQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listQuotationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.enum(["draft", "sent", "viewed", "accepted", "expired", "converted"]).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "quotationNumber", "total", "validUntil"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const publicQuotationSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});