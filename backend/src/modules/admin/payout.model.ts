import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export type PayoutStatus = "pending" | "paid" | "cancelled";

export interface PayoutDocument extends Document {
  agencyId: Types.ObjectId;
  staffId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PayoutStatus;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<PayoutDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "paid",
      index: true,
    },
    paidAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PayoutSchema.index({ agencyId: 1, staffId: 1 });
PayoutSchema.index({ agencyId: 1, status: 1 });

export const PayoutModel = models.Payout || model<PayoutDocument>("Payout", PayoutSchema);
