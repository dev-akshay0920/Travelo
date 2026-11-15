import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export interface LeadPipelineDocument extends Document {
  agencyId: Types.ObjectId;
  name: string;
  order: number;
  probability: number;
  color: string;
  isDefault: boolean;
  isClosedWon: boolean;
  isClosedLost: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadPipelineSchema = new Schema<LeadPipelineDocument>(
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
    order: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      default: "#6B7280",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isClosedWon: {
      type: Boolean,
      default: false,
    },
    isClosedLost: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

LeadPipelineSchema.index({ agencyId: 1, order: 1 });
LeadPipelineSchema.index({ agencyId: 1, isDefault: 1 });

export const LeadPipeline =
  models.LeadPipeline || model<LeadPipelineDocument>("LeadPipeline", LeadPipelineSchema);