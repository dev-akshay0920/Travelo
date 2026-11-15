import { Schema, model, models, Document } from "mongoose";

export interface SubscriptionPlanDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeature {
  key: string;
  name: string;
  description?: string;
  included: boolean;
}

export interface SubscriptionLimits {
  maxStaff: number;
  maxLeadsPerMonth: number;
  maxBookingsPerMonth: number;
  maxStorageGB: number;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

const SubscriptionFeatureSchema = new Schema<SubscriptionFeature>(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    included: { type: Boolean, default: true },
  },
  { _id: false }
);

const SubscriptionLimitsSchema = new Schema<SubscriptionLimits>(
  {
    maxStaff: { type: Number, default: 5 },
    maxLeadsPerMonth: { type: Number, default: 100 },
    maxBookingsPerMonth: { type: Number, default: 50 },
    maxStorageGB: { type: Number, default: 5 },
    apiAccess: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
  },
  { _id: false }
);

const SubscriptionPlanSchema = new Schema<SubscriptionPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    priceMonthly: { type: Number, required: true, min: 0 },
    priceYearly: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    features: { type: [SubscriptionFeatureSchema], default: [] },
    limits: { type: SubscriptionLimitsSchema, required: true },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SubscriptionPlanSchema.index({ slug: 1 }, { unique: true });
SubscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });

export const SubscriptionPlanModel = models.SubscriptionPlan || model<SubscriptionPlanDocument>("SubscriptionPlan", SubscriptionPlanSchema);