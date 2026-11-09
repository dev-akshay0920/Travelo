import { Types } from "mongoose";
import type { WatchlistDocument } from "./watchlist.model";
import { Watchlist } from "./watchlist.model";

export interface WatchlistCreateInput {
  travellerId: Types.ObjectId;
  packageId: Types.ObjectId;
}

export interface WatchlistFilters {
  travellerId: string;
  status?: "active" | "removed";
  page?: number;
  limit?: number;
}

export interface WatchlistListResponse {
  items: Array<{ id: string; packageId: string; createdAt: Date; updatedAt: Date }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const WatchlistRepository = {
  async findByTravellerAndPackage(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<WatchlistDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Watchlist.findOne({ travellerId, packageId }).exec();
  },

  async findByTraveller(filters: WatchlistFilters): Promise<WatchlistListResponse> {
    if (!Types.ObjectId.isValid(filters.travellerId)) {
      return { items: [], total: 0, page: 1, limit: filters.limit || 10, totalPages: 0 };
    }

    const query: Record<string, unknown> = { travellerId: filters.travellerId };
    if (filters.status) {
      query.status = filters.status;
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Watchlist.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Watchlist.countDocuments(query).exec(),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((doc: WatchlistDocument) => ({
        id: String(doc._id),
        packageId: String(doc.packageId),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async create(input: WatchlistCreateInput): Promise<WatchlistDocument> {
    const watchlist = new Watchlist(input);
    return watchlist.save();
  },

  async updateStatus(travellerId: Types.ObjectId, packageId: Types.ObjectId, status: "active" | "removed"): Promise<WatchlistDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Watchlist.findOneAndUpdate(
      { travellerId, packageId },
      { $set: { status } },
      { new: true, upsert: true }
    ).exec();
    return updated as Promise<WatchlistDocument | null>;
  },

  async remove(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    const result = await (Watchlist as unknown as { deleteOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ deletedCount: number }> } }).deleteOne({ travellerId, packageId }).exec();
    return result.deletedCount === 1;
  },

  async countByTraveller(travellerId: Types.ObjectId): Promise<number> {
    if (!Types.ObjectId.isValid(travellerId)) {
      return 0;
    }
    return Watchlist.countDocuments({ travellerId, status: "active" }).exec();
  },

  async isSaved(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    const count = await Watchlist.countDocuments({ travellerId, packageId, status: "active" }).exec();
    return count > 0;
  },
};
