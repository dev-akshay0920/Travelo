import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewDocument extends Document {
  travellerId: Types.ObjectId;
  packageId: Types.ObjectId;
  agencyId: Types.ObjectId;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    travellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ travellerId: 1, packageId: 1 }, { unique: true });
ReviewSchema.index({ packageId: 1, status: 1 });
ReviewSchema.index({ agencyId: 1, status: 1 });
ReviewSchema.index({ rating: 1 });

export const Review = models.Review || model<ReviewDocument>("Review", ReviewSchema);
