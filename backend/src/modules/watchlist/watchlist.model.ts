import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type WatchlistStatus = "active" | "removed";

export interface WatchlistDocument extends Document {
  travellerId: Types.ObjectId;
  packageId: Types.ObjectId;
  status: WatchlistStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistDocument>(
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
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

WatchlistSchema.index({ travellerId: 1, packageId: 1 }, { unique: true });
WatchlistSchema.index({ travellerId: 1, status: 1, createdAt: -1 });

export const Watchlist = models.Watchlist || model<WatchlistDocument>("Watchlist", WatchlistSchema);
