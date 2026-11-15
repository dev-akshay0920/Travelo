import { Types } from "mongoose";
import { AgencySubscriptionModel } from "./agency-subscription.model";
import type { AgencySubscriptionDocument } from "./agency-subscription.model";
import type { AgencySubscriptionListQuery } from "./agency-subscription.types";

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

export class AgencySubscriptionRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    planId: Types.ObjectId;
    status?: "trial" | "active" | "past_due" | "cancelled" | "expired";
    billingCycle?: "monthly" | "yearly";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt?: Date;
    cancelAtPeriodEnd?: boolean;
    paymentMethod?: string;
    paymentMethodDetails?: Record<string, unknown>;
    autoRenew?: boolean;
    nextBillingAt?: Date;
    metadata?: Record<string, unknown>;
  }): Promise<AgencySubscriptionDocument> {
    const subscription = new AgencySubscriptionModel({
      ...data,
      agencyId: data.agencyId,
      planId: data.planId,
      status: data.status || "trial",
      billingCycle: data.billingCycle || "monthly",
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      trialEndsAt: data.trialEndsAt,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      paymentMethod: data.paymentMethod,
      paymentMethodDetails: data.paymentMethodDetails,
      autoRenew: data.autoRenew ?? true,
      nextBillingAt: data.nextBillingAt,
      metadata: data.metadata,
    });
    return subscription.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<AgencySubscriptionDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.findOne({ _id: id, agencyId }).exec();
  }

  async findByAgencyId(agencyId: Types.ObjectId): Promise<AgencySubscriptionDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.findOne({ agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      planId: Types.ObjectId;
      status: "trial" | "active" | "past_due" | "cancelled" | "expired";
      billingCycle: "monthly" | "yearly";
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      trialEndsAt: Date;
      cancelledAt: Date;
      cancelAtPeriodEnd: boolean;
      paymentMethod: string;
      paymentMethodDetails: Record<string, unknown>;
      autoRenew: boolean;
      lastPaymentAt: Date;
      lastPaymentAmount: number;
      lastPaymentMethod: string;
      nextBillingAt: Date;
      metadata: Record<string, unknown>;
    }>
  ): Promise<AgencySubscriptionDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await AgencySubscriptionModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: AgencySubscriptionListQuery): Promise<{
    items: AgencySubscriptionLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, status, billingCycle, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (status) filter.status = status;
    if (billingCycle) filter.billingCycle = billingCycle;
    if (search) {
      filter.$or = [];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      AgencySubscriptionModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      AgencySubscriptionModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as AgencySubscriptionLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listAll(query: AgencySubscriptionListQuery): Promise<{
    items: AgencySubscriptionLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, status, billingCycle, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (billingCycle) filter.billingCycle = billingCycle;
    if (search) {
      filter.$or = [];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      AgencySubscriptionModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      AgencySubscriptionModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as AgencySubscriptionLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpiringTrials(days: number = 3): Promise<AgencySubscriptionLean[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.find({
      status: "trial",
      trialEndsAt: { $gte: now, $lte: future },
    }).lean().exec();
  }

  async getPastDueSubscriptions(): Promise<AgencySubscriptionLean[]> {
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.find({
      status: { $in: ["active", "past_due"] },
      currentPeriodEnd: { $lt: now },
    }).lean().exec();
  }

  async getUpcomingRenewals(days: number = 7): Promise<AgencySubscriptionLean[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return AgencySubscriptionModel.find({
      status: { $in: ["active", "trial"] },
      nextBillingAt: { $gte: now, $lte: future },
    }).lean().exec();
  }

  async countByStatus(): Promise<Record<string, number>> {
    const result = await AgencySubscriptionModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }
}

export const agencySubscriptionRepository = new AgencySubscriptionRepository();