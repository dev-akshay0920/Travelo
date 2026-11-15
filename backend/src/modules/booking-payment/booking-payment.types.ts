import type { BookingPaymentDocument } from "./booking-payment.model";
import { Types } from "mongoose";

export interface CreateBookingPaymentInput {
  bookingId: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt?: string | Date;
  notes?: string;
}

export interface UpdateBookingPaymentInput {
  bookingId?: string;
  invoiceId?: string;
  amount?: number;
  currency?: string;
  method?: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt?: string | Date;
  notes?: string;
}

export interface BookingPaymentListQuery {
  page?: number;
  limit?: number;
  bookingId?: string;
  invoiceId?: string;
  method?: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  paidFrom?: string | Date;
  paidTo?: string | Date;
  sortBy?: "createdAt" | "updatedAt" | "amount" | "paidAt";
  sortOrder?: "asc" | "desc";
}

export interface BookingPaymentListResponse {
  items: BookingPaymentDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingPaymentDTO {
  id: string;
  agencyId: string;
  bookingId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingPaymentLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: string;
  method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt: Date;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export function toBookingPaymentDTO(doc: BookingPaymentDocument | BookingPaymentLean): BookingPaymentDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    bookingId: doc.bookingId.toString(),
    invoiceId: doc.invoiceId?.toString(),
    amount: doc.amount,
    currency: doc.currency,
    method: doc.method,
    transactionId: doc.transactionId,
    paidAt: doc.paidAt.toISOString(),
    notes: doc.notes,
    recordedBy: doc.recordedBy.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}