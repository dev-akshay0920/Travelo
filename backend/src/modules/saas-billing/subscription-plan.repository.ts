import type { Types } from "mongoose";
import { SubscriptionPlanModel } from "./subscription.model";
import type { SubscriptionPlanDocument } from "./subscription.model";
import type { SubscriptionPlanListQuery } from "./subscription-plan.types";

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

export class SubscriptionPlanRepository {
  async create(data: {
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
  }): Promise<SubscriptionPlanDocument> {
    const plan = new SubscriptionPlanModel({
      ...data,
      slug: data.slug,
      priceMonthly: data.priceMonthly,
      priceYearly: data.priceYearly,
      currency: data.currency || "INR",
      features: data.features || [],
      limits: data.limits,
      isActive: data.isActive ?? true,
      isPopular: data.isPopular ?? false,
      sortOrder: data.sortOrder ?? 0,
    });
    return plan.save();
  }

  async findById(id: Types.ObjectId): Promise<SubscriptionPlanDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SubscriptionPlanModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<SubscriptionPlanDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SubscriptionPlanModel.findOne({ slug }).exec();
  }

  async updateById(
    id: Types.ObjectId,
    data: Partial<{
      name: string;
      description: string;
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
    }>
  ): Promise<SubscriptionPlanDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SubscriptionPlanModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await SubscriptionPlanModel.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }

  async list(query: SubscriptionPlanListQuery): Promise<{
    items: SubscriptionPlanLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, isActive, sortBy = "sortOrder", sortOrder = "asc" } = query;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      SubscriptionPlanModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      SubscriptionPlanModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as SubscriptionPlanLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActivePlans(): Promise<SubscriptionPlanLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return SubscriptionPlanModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean().exec();
  }
}

export const subscriptionPlanRepository = new SubscriptionPlanRepository();