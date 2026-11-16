import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export interface DocumentFileDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentFileSchema = new Schema<DocumentFileDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    category: {
      type: String,
      enum: ["passport", "contract", "voucher", "itinerary", "quote", "invoice", "other"],
      required: true,
      index: true,
    },
    fileName: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    key: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

DocumentFileSchema.index({ agencyId: 1, category: 1 });
DocumentFileSchema.index({ agencyId: 1, createdAt: -1 });
DocumentFileSchema.index({ leadId: 1, category: 1 });
DocumentFileSchema.index({ bookingId: 1, category: 1 });

export const DocumentFileModel = models.DocumentFile || model<DocumentFileDocument>("DocumentFile", DocumentFileSchema);