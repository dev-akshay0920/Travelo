import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export interface SupplierDocument extends Document {
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

export interface SupplierRateCardDocument extends Document {
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

const SupplierSchema = new Schema<SupplierDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["hotel", "transport", "airline", "guide", "activity", "insurance", "other"],
      required: true,
      index: true,
    },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    gstin: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ agencyId: 1, name: 1 });
SupplierSchema.index({ agencyId: 1, category: 1 });
SupplierSchema.index({ agencyId: 1, isActive: 1 });

const SupplierRateCardSchema = new Schema<SupplierRateCardDocument>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    itemName: { type: String, required: true, trim: true },
    seasonStart: { type: Date },
    seasonEnd: { type: Date },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    unit: { type: String, required: true },
    minQuantity: { type: Number, min: 1 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

SupplierRateCardSchema.index({ supplierId: 1, itemName: 1 });

export const SupplierModel = models.Supplier || model<SupplierDocument>("Supplier", SupplierSchema);
export const SupplierRateCardModel = models.SupplierRateCard || model<SupplierRateCardDocument>("SupplierRateCard", SupplierRateCardSchema);