import { Schema, model, models, Document, Types } from "mongoose";

export interface PlatformInvoiceDocument extends Document {
  agencyId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxPercentage: number;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: "razorpay" | "stripe" | "bank_transfer" | "manual";
  paymentReference?: string;
  pdfUrl?: string;
  pdfKey?: string;
  notes?: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformInvoiceSchema = new Schema<PlatformInvoiceDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "AgencySubscription", required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "void", "refunded"],
      required: true,
      default: "draft",
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    taxPercentage: { type: Number, default: 0 },
    dueDate: { type: Date, required: true, index: true },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ["razorpay", "stripe", "bank_transfer", "manual"] },
    paymentReference: { type: String },
    pdfUrl: { type: String },
    pdfKey: { type: String },
    notes: { type: String, trim: true },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

PlatformInvoiceSchema.index({ agencyId: 1, status: 1 });
PlatformInvoiceSchema.index({ agencyId: 1, createdAt: -1 });
PlatformInvoiceSchema.index({ dueDate: 1, status: 1 });

export const PlatformInvoiceModel = models.PlatformInvoice || model<PlatformInvoiceDocument>("PlatformInvoice", PlatformInvoiceSchema);