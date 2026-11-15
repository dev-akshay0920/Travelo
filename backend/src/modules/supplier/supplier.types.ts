import type { SupplierDocument, SupplierRateCardDocument } from "./supplier.model";
import { Types } from "mongoose";

export interface CreateSupplierInput {
  name: string;
  category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  category?: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

export interface SupplierListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  isActive?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "name" | "category" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface SupplierListResponse {
  items: SupplierDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierDTO {
  id: string;
  agencyId: string;
  name: string;
  category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupplierLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  name: string;
  category: "hotel" | "transport" | "airline" | "guide" | "activity" | "insurance" | "other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toSupplierDTO(doc: SupplierDocument | SupplierLean): SupplierDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    name: doc.name,
    category: doc.category,
    contactPerson: doc.contactPerson,
    phone: doc.phone,
    email: doc.email,
    address: doc.address,
    gstin: doc.gstin,
    rating: doc.rating,
    notes: doc.notes,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Rate Card types
export interface CreateSupplierRateCardInput {
  supplierId: string;
  itemName: string;
  seasonStart?: string | Date;
  seasonEnd?: string | Date;
  price: number;
  currency?: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
}

export interface UpdateSupplierRateCardInput {
  itemName?: string;
  seasonStart?: string | Date;
  seasonEnd?: string | Date;
  price?: number;
  currency?: string;
  unit?: string;
  minQuantity?: number;
  notes?: string;
}

export interface SupplierRateCardListQuery {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  sortBy?: "createdAt" | "updatedAt" | "itemName" | "price";
  sortOrder?: "asc" | "desc";
}

export interface SupplierRateCardListResponse {
  items: SupplierRateCardDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierRateCardDTO {
  id: string;
  supplierId: string;
  itemName: string;
  seasonStart?: string;
  seasonEnd?: string;
  price: number;
  currency: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierRateCardLean {
  _id: Types.ObjectId;
  supplierId: Types.ObjectId;
  itemName: string;
  seasonStart?: Date;
  seasonEnd?: Date;
  price: number;
  currency: string;
  unit: string;
  minQuantity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toSupplierRateCardDTO(doc: SupplierRateCardDocument | SupplierRateCardLean): SupplierRateCardDTO {
  return {
    id: doc._id.toString(),
    supplierId: doc.supplierId.toString(),
    itemName: doc.itemName,
    seasonStart: doc.seasonStart?.toISOString(),
    seasonEnd: doc.seasonEnd?.toISOString(),
    price: doc.price,
    currency: doc.currency,
    unit: doc.unit,
    minQuantity: doc.minQuantity,
    notes: doc.notes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}