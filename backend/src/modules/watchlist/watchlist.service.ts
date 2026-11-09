import type {
  WatchlistFilters,
  WatchlistListResponse,
} from "./watchlist.repository";
import { WatchlistRepository } from "./watchlist.repository";
import { ValidationError } from "../../shared/errors/app-error";
import { Types } from "mongoose";

export interface ToggleWatchlistInput {
  travellerId: string;
  packageId: string;
}

export interface WatchlistItem {
  id: string;
  packageId: string;
  createdAt: string;
  updatedAt: string;
}

export const WatchlistService = {
  async toggleWatchlist(input: ToggleWatchlistInput): Promise<{ saved: boolean; watchlistItem?: WatchlistItem }> {
    const { travellerId, packageId } = input;

    if (!Types.ObjectId.isValid(travellerId)) {
      throw new ValidationError("Invalid traveller ID.");
    }
    if (!Types.ObjectId.isValid(packageId)) {
      throw new ValidationError("Invalid package ID.");
    }

    const existing = await WatchlistRepository.findByTravellerAndPackage(
      new Types.ObjectId(travellerId),
      new Types.ObjectId(packageId)
    );

    if (existing) {
      if (existing.status === "active") {
        await WatchlistRepository.remove(new Types.ObjectId(travellerId), new Types.ObjectId(packageId));
        return { saved: false };
      }
      // reactivate a removed item
      const updated = await WatchlistRepository.updateStatus(
        new Types.ObjectId(travellerId),
        new Types.ObjectId(packageId),
        "active"
      );
      return {
        saved: true,
        watchlistItem: updated
          ? {
              id: String(updated._id),
              packageId: String(updated.packageId),
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            }
          : undefined,
      };
    }

    const created = await WatchlistRepository.create({
      travellerId: new Types.ObjectId(travellerId),
      packageId: new Types.ObjectId(packageId),
    });
    return {
      saved: true,
      watchlistItem: {
        id: String(created._id),
        packageId: String(created.packageId),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  },

  async getWatchlist(filters: WatchlistFilters): Promise<WatchlistListResponse> {
    return WatchlistRepository.findByTraveller(filters);
  },

  async isPackageSaved(travellerId: string, packageId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    return WatchlistRepository.isSaved(new Types.ObjectId(travellerId), new Types.ObjectId(packageId));
  },

  async getWatchlistCount(travellerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(travellerId)) {
      return 0;
    }
    return WatchlistRepository.countByTraveller(new Types.ObjectId(travellerId));
  },
};
