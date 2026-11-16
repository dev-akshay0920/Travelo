import type { ItineraryDocument, ItineraryDay } from "./itinerary.model";
import type { Types } from "mongoose";

export interface CreateItineraryInput {
  leadId?: string;
  packageId?: string;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days?: ItineraryDay[];
  totalPrice?: number;
  currency?: string;
  taxType?: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  advancePercentage?: number;
  isTemplate?: boolean;
  templateCategory?: string;
  aiGenerated?: boolean;
}

export interface UpdateItineraryInput {
  leadId?: string;
  packageId?: string;
  name?: string;
  destination?: string;
  durationDays?: number;
  durationNights?: number;
  days?: ItineraryDay[];
  totalPrice?: number;
  currency?: string;
  taxType?: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  advancePercentage?: number;
  isTemplate?: boolean;
  templateCategory?: string;
  aiGenerated?: boolean;
}

export interface ItineraryListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isTemplate?: boolean;
  leadId?: string;
  packageId?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "destination";
  sortOrder?: "asc" | "desc";
}

export interface ItineraryListResponse {
  items: ItineraryDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItineraryDTO {
  id: string;
  agencyId: string;
  leadId?: string;
  packageId?: string;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];
  totalPrice: number;
  currency: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ItineraryLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];
  totalPrice: number;
  currency: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toItineraryDTO(doc: ItineraryDocument | ItineraryLean): ItineraryDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    leadId: doc.leadId?.toString(),
    packageId: doc.packageId?.toString(),
    name: doc.name,
    destination: doc.destination,
    durationDays: doc.durationDays,
    durationNights: doc.durationNights,
    days: doc.days,
    totalPrice: doc.totalPrice,
    currency: doc.currency,
    taxType: doc.taxType,
    taxPercentage: doc.taxPercentage,
    advancePercentage: doc.advancePercentage,
    isTemplate: doc.isTemplate,
    templateCategory: doc.templateCategory,
    aiGenerated: doc.aiGenerated,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}