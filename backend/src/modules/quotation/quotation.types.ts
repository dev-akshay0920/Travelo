import type { QuotationDocument } from "./quotation.model";
import { Types } from "mongoose";

export interface CreateQuotationInput {
  leadId: string;
  itineraryId?: string;
  status?: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  currency?: string;
  validUntil: string | Date;
  notes?: string;
  termsAndConditions?: string;
}

export interface UpdateQuotationInput {
  leadId?: string;
  itineraryId?: string;
  status?: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  currency?: string;
  validUntil?: string | Date;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink?: string;
  shareLinkExpiresAt?: string | Date;
  notes?: string;
  termsAndConditions?: string;
}

export interface QuotationListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  leadId?: string;
  sortBy?: "createdAt" | "updatedAt" | "quotationNumber" | "total" | "validUntil";
  sortOrder?: "asc" | "desc";
}

export interface QuotationListResponse {
  items: QuotationDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuotationDTO {
  id: string;
  agencyId: string;
  leadId: string;
  itineraryId?: string;
  quotationNumber: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: string;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;
  shareLinkExpiresAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuotationLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  quotationNumber: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: Date;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;
  shareLinkExpiresAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toQuotationDTO(doc: QuotationDocument | QuotationLean): QuotationDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    leadId: doc.leadId.toString(),
    itineraryId: doc.itineraryId?.toString(),
    quotationNumber: doc.quotationNumber,
    status: doc.status,
    subtotal: doc.subtotal,
    taxAmount: doc.taxAmount,
    discountAmount: doc.discountAmount,
    total: doc.total,
    currency: doc.currency,
    validUntil: doc.validUntil.toISOString(),
    pdfUrl: doc.pdfUrl,
    pdfKey: doc.pdfKey,
    publicShareLink: doc.publicShareLink,
    shareLinkExpiresAt: doc.shareLinkExpiresAt?.toISOString(),
    viewedAt: doc.viewedAt?.toISOString(),
    acceptedAt: doc.acceptedAt?.toISOString(),
    notes: doc.notes,
    termsAndConditions: doc.termsAndConditions,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}