import { z } from "zod";

export const createBookingPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    amount: z.number().min(0.01),
    currency: z.string().length(3).default("INR"),
    method: z.enum(["cash", "bank_transfer", "cheque", "online_link", "razorpay", "stripe"]),
    transactionId: z.string().max(100).optional(),
    paidAt: z.string().datetime().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateBookingPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    amount: z.number().min(0.01).optional(),
    currency: z.string().length(3).optional(),
    method: z.enum(["cash", "bank_transfer", "cheque", "online_link", "razorpay", "stripe"]).optional(),
    transactionId: z.string().max(100).optional(),
    paidAt: z.string().datetime().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const getBookingPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listBookingPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    method: z.enum(["cash", "bank_transfer", "cheque", "online_link", "razorpay", "stripe"]).optional(),
    paidFrom: z.string().datetime().optional(),
    paidTo: z.string().datetime().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "amount", "paidAt"]).default("paidAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteBookingPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});