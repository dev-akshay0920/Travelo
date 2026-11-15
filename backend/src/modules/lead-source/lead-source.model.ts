import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export interface LeadSourceDocument extends Document {
  agencyId: Types.ObjectId;
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  costPerLead?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSourceSchema = new Schema<LeadSourceDocument>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    utmSource: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    utmMedium: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    utmCampaign: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    costPerLead: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

LeadSourceSchema.index({ agencyId: 1, name: 1 }, { unique: true });
LeadSourceSchema.index({ agencyId: 1, isActive: 1 });

export const LeadSource =
  models.LeadSource || model<LeadSourceDocument>("LeadSource", LeadSourceSchema);