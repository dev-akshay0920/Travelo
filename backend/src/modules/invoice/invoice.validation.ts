import { z } from "zod";

export const createInvoiceSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    type: z.enum(["proforma", "tax_invoice", "receipt"]),
    subtotal: z.number().min(0),
    taxAmount: z.number().min(0).default(0),
    total: z.number().min(0),
    currency: z.string().length(3).default("INR"),
    gstin: z.string().max(15).optional(),
    taxPercentage: z.number().min(0).max(100).default(0),
    dueDate: z.string().datetime().optional(),
    paidAmount: z.number().min(0).default(0),
    notes: z.string().max(5000).optional(),
    termsAndConditions: z.string().max(10000).optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    type: z.enum(["proforma", "tax_invoice", "receipt"]).optional(),
    status: z.enum(["unpaid", "partial", "paid", "overdue", "cancelled"]).optional(),
    subtotal: z.number().min(0).optional(),
    taxAmount: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    gstin: z.string().max(15).optional(),
    taxPercentage: z.number().min(0).max(100).optional(),
    dueDate: z.string().datetime().optional(),
    paidAmount: z.number().min(0).optional(),
    pdfUrl: z.string().url().optional(),
    pdfKey: z.string().optional(),
    paymentLinkUrl: z.string().url().optional(),
    paymentLinkExpiresAt: z.string().datetime().optional(),
    notes: z.string().max(5000).optional(),
    termsAndConditions: z.string().max(10000).optional(),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listInvoicesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    type: z.enum(["proforma", "tax_invoice", "receipt"]).optional(),
    status: z.enum(["unpaid", "partial", "paid", "overdue", "cancelled"]).optional(),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "invoiceNumber", "total", "dueDate"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteInvoiceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    status: z.enum(["unpaid", "partial", "paid", "overdue", "cancelled"]),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    amount: z.number().min(0.01),
    method: z.enum(["cash", "bank_transfer", "cheque", "online_link", "razorpay", "stripe"]),
    transactionId: z.string().optional(),
    notes: z.string().max(5000).optional(),
  }),
});

export const generatePaymentLinkSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    expiresInDays: z.coerce.number().int().min(1).max(365).default(30),
  }).optional(),
});