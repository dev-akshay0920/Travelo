import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type PolicyTemplateType = "terms" | "cancellation";

export interface PolicyTemplateDocument extends Document {
  name: string;
  type: PolicyTemplateType;
  content: string;
  agencyId?: Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PolicyTemplateSchema = new Schema<PolicyTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["terms", "cancellation"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PolicyTemplateSchema.index({ agencyId: 1, name: 1 }, { unique: true, partialFilterExpression: { agencyId: { $exists: true } } });

PolicyTemplateSchema.set("toJSON", {
  transform: (_: unknown, ret: unknown) => {
    const record = ret as Record<string, unknown>;
    record.id = record._id;
    delete record._id;
    delete record.__v;
    return record;
  },
});

export const PolicyTemplate = models.PolicyTemplate || model<PolicyTemplateDocument>("PolicyTemplate", PolicyTemplateSchema);
