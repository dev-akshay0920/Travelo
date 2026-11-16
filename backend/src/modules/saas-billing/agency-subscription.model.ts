import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export interface AgencySubscriptionDocument extends Document {
  agencyId: Types.ObjectId;
  planId: Types.ObjectId;
  status: "trial" | "active" | "past_due" | "cancelled" | "expired";
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: "razorpay" | "stripe" | "bank_transfer" | "manual";
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

const AgencySubscriptionSchema = new Schema<AgencySubscriptionDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, unique: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true, index: true },
    status: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "expired"],
      required: true,
      default: "trial",
      index: true,
    },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true, default: "monthly" },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    trialEndsAt: { type: Date, index: true },
    cancelledAt: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["razorpay", "stripe", "bank_transfer", "manual"] },
    paymentMethodDetails: { type: Schema.Types.Mixed },
    autoRenew: { type: Boolean, default: true },
    lastPaymentAt: { type: Date },
    lastPaymentAmount: { type: Number },
    lastPaymentMethod: { type: String },
    nextBillingAt: { type: Date, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AgencySubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
AgencySubscriptionSchema.index({ nextBillingAt: 1, status: 1 });

export const AgencySubscriptionModel = models.AgencySubscription || model<AgencySubscriptionDocument>("AgencySubscription", AgencySubscriptionSchema);