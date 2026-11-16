import type { PlatformInvoiceDocument } from "./platform-invoice.model";
import type { Types } from "mongoose";

export type PlatformInvoicePaymentMethod = "razorpay" | "stripe" | "bank_transfer" | "manual";

export interface CreatePlatformInvoiceInput {
  agencyId: string;
  subscriptionId: string;
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  taxPercentage?: number;
  dueDate: string | Date;
  paymentMethod?: PlatformInvoicePaymentMethod;
  billingPeriodStart: string | Date;
  billingPeriodEnd: string | Date;
  notes?: string;
}

export interface UpdatePlatformInvoiceInput {
  status?: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  paidAt?: string | Date;
  paymentMethod?: PlatformInvoicePaymentMethod;
  paymentReference?: string;
  pdfUrl?: string;
  pdfKey?: string;
  notes?: string;
}

export interface PlatformInvoiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  agencyId?: string;
  dueFrom?: string | Date;
  dueTo?: string | Date;
  sortBy?: "createdAt" | "updatedAt" | "invoiceNumber" | "total" | "dueDate";
  sortOrder?: "asc" | "desc";
}

export interface PlatformInvoiceListResponse {
  items: PlatformInvoiceDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlatformInvoiceDTO {
  id: string;
  agencyId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxPercentage: number;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  pdfUrl?: string;
  pdfKey?: string;
  notes?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

interface PlatformInvoiceLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxPercentage: number;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  pdfUrl?: string;
  pdfKey?: string;
  notes?: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function toPlatformInvoiceDTO(doc: PlatformInvoiceDocument | PlatformInvoiceLean): PlatformInvoiceDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    subscriptionId: doc.subscriptionId.toString(),
    invoiceNumber: doc.invoiceNumber,
    status: doc.status,
    subtotal: doc.subtotal,
    taxAmount: doc.taxAmount,
    total: doc.total,
    currency: doc.currency,
    taxPercentage: doc.taxPercentage,
    dueDate: doc.dueDate.toISOString(),
    paidAt: doc.paidAt?.toISOString(),
    paymentMethod: doc.paymentMethod,
    paymentReference: doc.paymentReference,
    pdfUrl: doc.pdfUrl,
    pdfKey: doc.pdfKey,
    notes: doc.notes,
    billingPeriodStart: doc.billingPeriodStart.toISOString(),
    billingPeriodEnd: doc.billingPeriodEnd.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}