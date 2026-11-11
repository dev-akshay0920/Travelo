import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadDocument extends Document {
  agencyId: Types.ObjectId;
  packageId?: Types.ObjectId;
  packageName?: string;
  travelerId: Types.ObjectId;
  travelerName: string;
  travelerEmail: string;
  message: string;
  requestedStartDate?: Date;
  travelerCount?: number;
  status: LeadStatus;
  agencyNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<LeadDocument>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    packageName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    travelerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    travelerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    travelerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    requestedStartDate: {
      type: Date,
    },
    travelerCount: {
      type: Number,
      min: 1,
      max: 30,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new",
      required: true,
    },
    agencyNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

LeadSchema.index({ agencyId:  1, createdAt: -1 });
LeadSchema.index({ agencyId: 1, status: 1, createdAt: -1 });
LeadSchema.index({ agencyId: 1, packageId: 1, createdAt: -1 });
LeadSchema.index({ travelerId: 1, createdAt: -1 });

export const Lead = models.Lead || model<LeadDocument>("Lead", LeadSchema);
