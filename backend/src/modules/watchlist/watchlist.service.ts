import type {
  WatchlistFilters,
  WatchlistListResponse,
} from "./watchlist.repository";
import { WatchlistRepository } from "./watchlist.repository";
import { ValidationError } from "../../shared/errors/app-error";
import { Types } from "mongoose";

export interface ToggleWatchlistInput {
  travellerId: string;
  packageId?: string;
  agencyId?: string;
  itemType: "package" | "agency";
}

export interface WatchlistItem {
  id: string;
  packageId?: string;
  agencyId?: string;
  itemType: "package" | "agency";
  createdAt: string;
  updatedAt: string;
}

export const WatchlistService = {
  async toggleWatchlist(input: ToggleWatchlistInput): Promise<{ saved: boolean; watchlistItem?: WatchlistItem }> {
    const { travellerId, itemType } = input;

    if (!Types.ObjectId.isValid(travellerId)) {
      throw new ValidationError("Invalid traveller ID.");
    }

    if (itemType === "package") {
      const { packageId } = input;
      if (!packageId || typeof packageId !== "string") {
        throw new ValidationError("Package ID is required.");
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
                itemType: updated.itemType,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
              }
            : undefined,
        };
      }

      const created = await WatchlistRepository.create({
        travellerId: new Types.ObjectId(travellerId),
        packageId: new Types.ObjectId(packageId),
        itemType: "package",
      });
      return {
        saved: true,
        watchlistItem: {
          id: String(created._id),
          packageId: String(created.packageId),
          itemType: created.itemType,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      };
    } else {
      const { agencyId } = input;
      if (!agencyId || typeof agencyId !== "string") {
        throw new ValidationError("Agency ID is required.");
      }
      if (!Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError("Invalid agency ID.");
      }

      const existing = await WatchlistRepository.findByTravellerAndAgency(
        new Types.ObjectId(travellerId),
        new Types.ObjectId(agencyId)
      );

      if (existing) {
        if (existing.status === "active") {
          await WatchlistRepository.removeAgency(new Types.ObjectId(travellerId), new Types.ObjectId(agencyId));
          return { saved: false };
        }
        const updated = await WatchlistRepository.updateAgencyStatus(
          new Types.ObjectId(travellerId),
          new Types.ObjectId(agencyId),
          "active"
        );
        return {
          saved: true,
          watchlistItem: updated
            ? {
                id: String(updated._id),
                agencyId: String(updated.agencyId),
                itemType: updated.itemType,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
              }
            : undefined,
        };
      }

      const created = await WatchlistRepository.create({
        travellerId: new Types.ObjectId(travellerId),
        agencyId: new Types.ObjectId(agencyId),
        itemType: "agency",
      });
      return {
        saved: true,
        watchlistItem: {
          id: String(created._id),
          agencyId: String(created.agencyId),
          itemType: created.itemType,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      };
    }
  },

  async getWatchlist(filters: WatchlistFilters): Promise<WatchlistListResponse> {
    return WatchlistRepository.findByTraveller(filters);
  },

  async isPackageSaved(travellerId: string, packageId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return false;
    }
    return WatchlistRepository.isPackageSaved(new Types.ObjectId(travellerId), new Types.ObjectId(packageId));
  },

  async isAgencySaved(travellerId: string, agencyId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(agencyId)) {
      return false;
    }
    return WatchlistRepository.isAgencySaved(new Types.ObjectId(travellerId), new Types.ObjectId(agencyId));
  },

  async getWatchlistCount(travellerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(travellerId)) {
      return 0;
    }
    return WatchlistRepository.countByTraveller(new Types.ObjectId(travellerId));
  },
};
