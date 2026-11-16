import type { AgencySubscriptionDocument } from "./agency-subscription.model";
import type { Types } from "mongoose";

export interface CreateAgencySubscriptionInput {
  agencyId: string;
  planId: string;
  billingCycle?: "monthly" | "yearly";
  trialDays?: number;
  paymentMethod?: "razorpay" | "stripe" | "bank_transfer" | "manual";
  autoRenew?: boolean;
}

export interface UpdateAgencySubscriptionInput {
  planId?: string;
  billingCycle?: "monthly" | "yearly";
  status?: "trial" | "active" | "past_due" | "cancelled" | "expired";
  paymentMethod?: "razorpay" | "stripe" | "bank_transfer" | "manual";
  paymentMethodDetails?: Record<string, unknown>;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  nextBillingAt?: string | Date;
}

export interface AgencySubscriptionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "trial" | "active" | "past_due" | "cancelled" | "expired";
  billingCycle?: "monthly" | "yearly";
  sortBy?: "createdAt" | "updatedAt" | "currentPeriodEnd" | "nextBillingAt";
  sortOrder?: "asc" | "desc";
}

export interface AgencySubscriptionListResponse {
  items: AgencySubscriptionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgencySubscriptionDTO {
  id: string;
  agencyId: string;
  planId: string;
  planName?: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "expired";
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
  paymentMethodDetails?: Record<string, unknown>;
  autoRenew: boolean;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
  lastPaymentMethod?: string;
  nextBillingAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface AgencySubscriptionLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  planId: Types.ObjectId;
  status: "trial" | "active" | "past_due" | "cancelled" | "expired";
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
  paymentMethodDetails?: Record<string, unknown>;
  autoRenew: boolean;
  lastPaymentAt?: Date;
  lastPaymentAmount?: number;
  lastPaymentMethod?: string;
  nextBillingAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export function toAgencySubscriptionDTO(doc: AgencySubscriptionDocument | AgencySubscriptionLean, planName?: string): AgencySubscriptionDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    planId: doc.planId.toString(),
    planName,
    status: doc.status,
    billingCycle: doc.billingCycle,
    currentPeriodStart: doc.currentPeriodStart.toISOString(),
    currentPeriodEnd: doc.currentPeriodEnd.toISOString(),
    trialEndsAt: doc.trialEndsAt?.toISOString(),
    cancelledAt: doc.cancelledAt?.toISOString(),
    cancelAtPeriodEnd: doc.cancelAtPeriodEnd,
    paymentMethod: doc.paymentMethod,
    paymentMethodDetails: doc.paymentMethodDetails,
    autoRenew: doc.autoRenew,
    lastPaymentAt: doc.lastPaymentAt?.toISOString(),
    lastPaymentAmount: doc.lastPaymentAmount,
    lastPaymentMethod: doc.lastPaymentMethod,
    nextBillingAt: doc.nextBillingAt?.toISOString(),
    metadata: doc.metadata,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}