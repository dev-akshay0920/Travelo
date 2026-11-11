import { Types } from "mongoose";
import type { WatchlistDocument, WatchlistItemType } from "./watchlist.model";
import { Watchlist } from "./watchlist.model";

export interface WatchlistCreateInput {
  travellerId: Types.ObjectId;
  packageId?: Types.ObjectId;
  agencyId?: Types.ObjectId;
  itemType: WatchlistItemType;
}

export interface WatchlistFilters {
  travellerId: string;
  itemType?: WatchlistItemType;
  status?: "active" | "removed";
  page?: number;
  limit?: number;
}

export interface WatchlistListResponse {
  items: Array<{
    id: string;
    packageId?: string;
    agencyId?: string;
    itemType: WatchlistItemType;
    createdAt: Date;
    updatedAt: Date;
    available?: boolean;
    package?: {
      id: string;
      name: string;
      destination: string;
      price: number;
      currency: string;
      priceType: string;
      status: string;
      availableSeats: number;
      agencyName: string;
      agencySlug: string;
      agencyLogo?: string;
      imageUrl?: string;
    } | null;
    agency?: {
      id: string;
      name: string;
      slug: string;
      destination: string;
      logo?: string;
    } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const WatchlistRepository = {
  async findSavedIds(
    travellerId: Types.ObjectId,
    packageIds: string[],
    agencyIds: string[]
  ): Promise<Array<{ itemType: WatchlistItemType; packageId?: Types.ObjectId; agencyId?: Types.ObjectId }>> {
    const clauses: Array<Record<string, unknown>> = [];
    if (packageIds.length) {
      clauses.push({
        itemType: "package",
        packageId: { $in: packageIds.map((id) => new Types.ObjectId(id)) },
      });
    }
    if (agencyIds.length) {
      clauses.push({
        itemType: "agency",
        agencyId: { $in: agencyIds.map((id) => new Types.ObjectId(id)) },
      });
    }
    if (clauses.length === 0) return [];
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Watchlist.find({
      travellerId,
      status: "active",
      $or: clauses,
    })
      .select("itemType packageId agencyId")
      .exec();
  },

  async findByTravellerAndPackage(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<WatchlistDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Watchlist.findOne({ travellerId, packageId, itemType: "package" }).exec();
  },

  async findByTravellerAndAgency(travellerId: Types.ObjectId, agencyId: Types.ObjectId): Promise<WatchlistDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Watchlist.findOne({ travellerId, agencyId, itemType: "agency" }).exec();
  },

  async findByTraveller(filters: WatchlistFilters): Promise<WatchlistListResponse> {
    if (!Types.ObjectId.isValid(filters.travellerId)) {
      return { items: [], total: 0, page: 1, limit: filters.limit || 10, totalPages: 0 };
    }

    const query: Record<string, unknown> = { travellerId: filters.travellerId };
    if (filters.itemType) {
      query.itemType = filters.itemType;
    }
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
        packageId: doc.packageId ? String(doc.packageId) : undefined,
        agencyId: doc.agencyId ? String(doc.agencyId) : undefined,
        itemType: doc.itemType,
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
      { travellerId, packageId, itemType: "package" },
      { $set: { status } },
      { new: true, upsert: true }
    ).exec();
    return updated as Promise<WatchlistDocument | null>;
  },

  async updateAgencyStatus(travellerId: Types.ObjectId, agencyId: Types.ObjectId, status: "active" | "removed"): Promise<WatchlistDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Watchlist.findOneAndUpdate(
      { travellerId, agencyId, itemType: "agency" },
      { $set: { status } },
      { new: true, upsert: true }
    ).exec();
    return updated as Promise<WatchlistDocument | null>;
  },

  async remove(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    const result = await (Watchlist as unknown as { deleteOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ deletedCount: number }> } }).deleteOne({ travellerId, packageId, itemType: "package" }).exec();
    return result.deletedCount === 1;
  },

  async removeAgency(travellerId: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return false;
    }
    const result = await (Watchlist as unknown as { deleteOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ deletedCount: number }> } }).deleteOne({ travellerId, agencyId, itemType: "agency" }).exec();
    return result.deletedCount === 1;
  },

  async countByTraveller(travellerId: Types.ObjectId): Promise<number> {
    if (!Types.ObjectId.isValid(travellerId)) {
      return 0;
    }
    return Watchlist.countDocuments({ travellerId, status: "active" }).exec();
  },

  async isPackageSaved(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    const count = await Watchlist.countDocuments({ travellerId, packageId, itemType: "package", status: "active" }).exec();
    return count > 0;
  },

  async isAgencySaved(travellerId: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return false;
    }
    const count = await Watchlist.countDocuments({ travellerId, agencyId, itemType: "agency", status: "active" }).exec();
    return count > 0;
  },
};
