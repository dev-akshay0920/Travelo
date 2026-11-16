import type { InvoiceDocument, InvoicePaymentMethod } from "./invoice.model";
import type { Types } from "mongoose";

export interface CreateInvoiceInput {
  bookingId?: string;
  leadId?: string;
  type: "proforma" | "tax_invoice" | "receipt";
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  gstin?: string;
  taxPercentage?: number;
  dueDate?: string | Date;
  paidAmount?: number;
  notes?: string;
  termsAndConditions?: string;
}

export interface UpdateInvoiceInput {
  bookingId?: string;
  leadId?: string;
  type?: "proforma" | "tax_invoice" | "receipt";
  status?: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  currency?: string;
  gstin?: string;
  taxPercentage?: number;
  dueDate?: string | Date;
  paidAmount?: number;
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: string | Date;
  notes?: string;
  termsAndConditions?: string;
}

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: "proforma" | "tax_invoice" | "receipt";
  status?: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  bookingId?: string;
  leadId?: string;
  sortBy?: "createdAt" | "updatedAt" | "invoiceNumber" | "total" | "dueDate";
  sortOrder?: "asc" | "desc";
}

export interface InvoiceListResponse {
  items: InvoiceDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoicePaymentDTO {
  amount: number;
  method: InvoicePaymentMethod;
  transactionId?: string;
  notes?: string;
  paidAt: string;
  recordedBy?: string;
}

export interface RecordInvoicePaymentInput {
  amount: number;
  method: InvoicePaymentMethod;
  transactionId?: string;
  notes?: string;
  paidAt?: string | Date;
}

export interface InvoiceDTO {
  id: string;
  agencyId: string;
  bookingId?: string;
  leadId?: string;
  invoiceNumber: string;
  type: "proforma" | "tax_invoice" | "receipt";
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: string;
  paidAmount: number;
  payments: InvoicePaymentDTO[];
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: string;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  invoiceNumber: string;
  type: "proforma" | "tax_invoice" | "receipt";
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: Date;
  paidAmount: number;
  payments?: InvoicePaymentDTO[];
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toInvoiceDTO(doc: InvoiceDocument | InvoiceLean): InvoiceDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    bookingId: doc.bookingId?.toString(),
    leadId: doc.leadId?.toString(),
    invoiceNumber: doc.invoiceNumber,
    type: doc.type,
    status: doc.status,
    subtotal: doc.subtotal,
    taxAmount: doc.taxAmount,
    total: doc.total,
    currency: doc.currency,
    gstin: doc.gstin,
    taxPercentage: doc.taxPercentage,
    dueDate: doc.dueDate?.toISOString(),
    paidAmount: doc.paidAmount,
    payments: (doc.payments ?? []).map((payment) => ({
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId,
      notes: payment.notes,
      paidAt: new Date(payment.paidAt).toISOString(),
      recordedBy: payment.recordedBy?.toString(),
    })),
    pdfUrl: doc.pdfUrl,
    pdfKey: doc.pdfKey,
    paymentLinkUrl: doc.paymentLinkUrl,
    paymentLinkExpiresAt: doc.paymentLinkExpiresAt?.toISOString(),
    notes: doc.notes,
    termsAndConditions: doc.termsAndConditions,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}