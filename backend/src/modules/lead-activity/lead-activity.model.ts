import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type LeadActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "note"
  | "status_change"
  | "document"
  | "task";

export interface LeadActivityDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  staffId?: Types.ObjectId;
  type: LeadActivityType;
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadActivitySchema = new Schema<LeadActivityDocument>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "call",
        "email",
        "whatsapp",
        "note",
        "status_change",
        "document",
        "task",
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

LeadActivitySchema.index({ leadId: 1, createdAt: -1 });
LeadActivitySchema.index({ agencyId: 1, leadId: 1, createdAt: -1 });

export const LeadActivity =
  models.LeadActivity || model<LeadActivityDocument>("LeadActivity", LeadActivitySchema);