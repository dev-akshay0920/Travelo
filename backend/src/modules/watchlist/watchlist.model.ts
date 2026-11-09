import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type WatchlistStatus = "active" | "removed";
export type WatchlistItemType = "package" | "agency";

export interface WatchlistDocument extends Document {
  travellerId: Types.ObjectId;
  packageId?: Types.ObjectId;
  agencyId?: Types.ObjectId;
  itemType: WatchlistItemType;
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
      required: false,
      index: true,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: false,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["package", "agency"],
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

WatchlistSchema.index({ travellerId: 1, itemType: 1, status: 1, createdAt: -1 });
WatchlistSchema.index({ travellerId: 1, packageId: 1 }, { unique: true, partialFilterExpression: { itemType: "package" } });
WatchlistSchema.index({ travellerId: 1, agencyId: 1 }, { unique: true, partialFilterExpression: { itemType: "agency" } });

export const Watchlist = models.Watchlist || model<WatchlistDocument>("Watchlist", WatchlistSchema);
