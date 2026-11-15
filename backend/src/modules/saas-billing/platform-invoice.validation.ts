import { z } from "zod";

export const createPlatformInvoiceSchema = z.object({
  body: z.object({
    agencyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    subscriptionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    subtotal: z.number().min(0),
    taxAmount: z.number().min(0).default(0),
    total: z.number().min(0),
    currency: z.string().length(3).default("INR"),
    taxPercentage: z.number().min(0).max(100).default(0),
    dueDate: z.string().datetime(),
    paymentMethod: z.enum(["razorpay", "stripe", "bank_transfer", "manual"]).optional(),
    billingPeriodStart: z.string().datetime(),
    billingPeriodEnd: z.string().datetime(),
    notes: z.string().max(2000).optional(),
  }),
});

export const updatePlatformInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    status: z.enum(["draft", "sent", "paid", "overdue", "void", "refunded"]).optional(),
    paidAt: z.string().datetime().optional(),
    paymentMethod: z.enum(["razorpay", "stripe", "bank_transfer", "manual"]).optional(),
    paymentReference: z.string().max(100).optional(),
    pdfUrl: z.string().url().optional(),
    pdfKey: z.string().optional(),
    notes: z.string().max(2000).optional(),
  }),
});

export const getPlatformInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listPlatformInvoicesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.enum(["draft", "sent", "paid", "overdue", "void", "refunded"]).optional(),
    agencyId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    dueFrom: z.string().datetime().optional(),
    dueTo: z.string().datetime().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "invoiceNumber", "total", "dueDate"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deletePlatformInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    paymentMethod: z.enum(["razorpay", "stripe", "bank_transfer", "manual"]),
    paymentReference: z.string().max(100).optional(),
    paidAt: z.string().datetime().optional(),
  }),
});