import { Schema, model, models, Document, Types } from "mongoose";

export interface QuotationDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  quotationNumber: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: Date;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;
  shareLinkExpiresAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<QuotationDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    itineraryId: { type: Schema.Types.ObjectId, ref: "Itinerary", index: true },
    quotationNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "accepted", "expired", "converted"],
      default: "draft",
      index: true,
    },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    validUntil: { type: Date, required: true },
    pdfUrl: { type: String },
    pdfKey: { type: String },
    publicShareLink: { type: String, required: true, unique: true },
    shareLinkExpiresAt: { type: Date },
    viewedAt: { type: Date },
    acceptedAt: { type: Date },
    notes: { type: String, trim: true },
    termsAndConditions: { type: String, trim: true },
  },
  { timestamps: true }
);

QuotationSchema.index({ agencyId: 1, status: 1 });
QuotationSchema.index({ agencyId: 1, createdAt: -1 });
QuotationSchema.index({ leadId: 1, status: 1 });
QuotationSchema.index({ publicShareLink: 1 }, { unique: true });

export const QuotationModel =
  models.Quotation || model<QuotationDocument>("Quotation", QuotationSchema);