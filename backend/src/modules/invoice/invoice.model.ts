import { Schema, model, models, Document, Types } from "mongoose";

export interface InvoiceDocument extends Document {
  agencyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  invoiceNumber: string;
  type: "proforma" | "tax_invoice" | "receipt";
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: Date;
  paidAmount: number;
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["proforma", "tax_invoice", "receipt"], required: true },
    status: { type: String, enum: ["unpaid", "partial", "paid", "overdue", "cancelled"], default: "unpaid", index: true },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    gstin: { type: String, trim: true },
    taxPercentage: { type: Number, default: 0 },
    dueDate: { type: Date },
    paidAmount: { type: Number, default: 0 },
    pdfUrl: { type: String },
    pdfKey: { type: String },
    paymentLinkUrl: { type: String },
    paymentLinkExpiresAt: { type: Date },
    notes: { type: String, trim: true },
    termsAndConditions: { type: String, trim: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ agencyId: 1, status: 1 });
InvoiceSchema.index({ agencyId: 1, type: 1 });
InvoiceSchema.index({ agencyId: 1, createdAt: -1 });
InvoiceSchema.index({ bookingId: 1 });
InvoiceSchema.index({ leadId: 1 });

export const InvoiceModel = models.Invoice || model<InvoiceDocument>("Invoice", InvoiceSchema);