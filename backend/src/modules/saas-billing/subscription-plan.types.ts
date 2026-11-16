import type { SubscriptionPlanDocument } from "./subscription.model";
import type { Types } from "mongoose";

export interface CreateSubscriptionPlanInput {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency?: string;
  features?: { key: string; name: string; description?: string; included: boolean }[];
  limits: {
    maxStaff: number;
    maxLeadsPerMonth: number;
    maxBookingsPerMonth: number;
    maxStorageGB: number;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  features?: { key: string; name: string; description?: string; included: boolean }[];
  limits?: {
    maxStaff: number;
    maxLeadsPerMonth: number;
    maxBookingsPerMonth: number;
    maxStorageGB: number;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface SubscriptionPlanListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "name" | "priceMonthly";
  sortOrder?: "asc" | "desc";
}

export interface SubscriptionPlanListResponse {
  items: SubscriptionPlanDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: { key: string; name: string; description?: string; included: boolean }[];
  limits: {
    maxStaff: number;
    maxLeadsPerMonth: number;
    maxBookingsPerMonth: number;
    maxStorageGB: number;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPlanLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: { key: string; name: string; description?: string; included: boolean }[];
  limits: {
    maxStaff: number;
    maxLeadsPerMonth: number;
    maxBookingsPerMonth: number;
    maxStorageGB: number;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toSubscriptionPlanDTO(doc: SubscriptionPlanDocument | SubscriptionPlanLean): SubscriptionPlanDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    priceMonthly: doc.priceMonthly,
    priceYearly: doc.priceYearly,
    currency: doc.currency,
    features: doc.features,
    limits: doc.limits,
    isActive: doc.isActive,
    isPopular: doc.isPopular,
    sortOrder: doc.sortOrder,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}