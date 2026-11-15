import type { DocumentFileDocument } from "./document.model";
import { Types } from "mongoose";

export interface CreateDocumentInput {
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  description?: string;
}

export interface UpdateDocumentInput {
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  category?: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName?: string;
  url?: string;
  key?: string;
  mimeType?: string;
  size?: number;
  description?: string;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  sortBy?: "createdAt" | "updatedAt" | "fileName" | "category" | "size";
  sortOrder?: "asc" | "desc";
}

export interface DocumentListResponse {
  items: DocumentDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentDTO {
  id: string;
  agencyId: string;
  leadId?: string;
  bookingId?: string;
  invoiceId?: string;
  category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toDocumentDTO(doc: DocumentFileDocument | DocumentLean): DocumentDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    leadId: doc.leadId?.toString(),
    bookingId: doc.bookingId?.toString(),
    invoiceId: doc.invoiceId?.toString(),
    category: doc.category,
    fileName: doc.fileName,
    url: doc.url,
    key: doc.key,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedBy: doc.uploadedBy.toString(),
    description: doc.description,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}