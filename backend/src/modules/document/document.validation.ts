import { z } from "zod";

export const createDocumentSchema = z.object({
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    category: z.enum(["passport", "contract", "voucher", "itinerary", "quote", "invoice", "other"]),
    fileName: z.string().min(1).max(255),
    url: z.string().url(),
    key: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().int().min(1),
    description: z.string().max(1000).optional(),
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    category: z.enum(["passport", "contract", "voucher", "itinerary", "quote", "invoice", "other"]).optional(),
    fileName: z.string().min(1).max(255).optional(),
    url: z.string().url().optional(),
    key: z.string().min(1).optional(),
    mimeType: z.string().min(1).optional(),
    size: z.number().int().min(1).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const getDocumentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listDocumentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    category: z.enum(["passport", "contract", "voucher", "itinerary", "quote", "invoice", "other"]).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "fileName", "category", "size"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteDocumentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});