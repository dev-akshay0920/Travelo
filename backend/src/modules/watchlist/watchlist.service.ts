import type {
  WatchlistFilters,
  WatchlistListResponse,
} from "./watchlist.repository";
import { WatchlistRepository } from "./watchlist.repository";
import { ValidationError } from "../../shared/errors/app-error";
import { Types } from "mongoose";
import type { WatchlistDocument } from "./watchlist.model";
import { UserRepository } from "../users/user.repository";
import { PackageRepository } from "../packages/package.repository";
import { AgencyRepository } from "../agencies/agency.repository";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../shared/errors/app-error";
import type { SavedStatusInput } from "./watchlist.validation";

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

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function toWatchlistItem(document: WatchlistDocument, itemType: "package" | "agency"): WatchlistItem {
  return {
    id: String(document._id),
    ...(itemType === "package" && document.packageId
      ? { packageId: String(document.packageId) }
      : {}),
    ...(itemType === "agency" && document.agencyId
      ? { agencyId: String(document.agencyId) }
      : {}),
    itemType,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

async function requireActiveTraveller(travellerId: string) {
  if (!Types.ObjectId.isValid(travellerId)) throw new UnauthorizedError();
  const user = await UserRepository.findByIdWithRole(travellerId);
  if (!user || user.status !== "active") throw new UnauthorizedError();
  if (user.roleId?.key !== "traveller") {
    throw new ForbiddenError("Traveler access is required.");
  }
  return user;
}

async function assertTargetCanBeSaved(itemType: "package" | "agency", targetId: string) {
  if (itemType === "agency") {
    const agency = await AgencyRepository.findById(targetId);
    if (!agency || agency.status !== "approved") {
      throw new NotFoundError("This agency is not available to save.");
    }
    return;
  }

  const pkg = await PackageRepository.findById(targetId);
  const now = new Date();
  if (
    !pkg ||
    pkg.status !== "active" ||
    pkg.visibility !== "public" ||
    pkg.availableSeats < 1 ||
    pkg.startDate <= now ||
    (pkg.bookingDeadline && pkg.bookingDeadline < now)
  ) {
    throw new NotFoundError("This package is not available to save.");
  }
  const agency = await AgencyRepository.findById(String(pkg.agencyId));
  if (!agency || agency.status !== "approved") {
    throw new NotFoundError("This package is not available to save.");
  }
}

export const WatchlistService = {
  async getSavedStatus(travellerId: string, input: SavedStatusInput) {
    await requireActiveTraveller(travellerId);
    const records = await WatchlistRepository.findSavedIds(
      new Types.ObjectId(travellerId),
      input.packageIds,
      input.agencyIds
    );
    return {
      packageIds: records.flatMap((item) => item.packageId ? [String(item.packageId)] : []),
      agencyIds: records.flatMap((item) => item.agencyId ? [String(item.agencyId)] : []),
    };
  },

  async toggleWatchlist(input: ToggleWatchlistInput): Promise<{ saved: boolean; watchlistItem?: WatchlistItem }> {
    const { travellerId, itemType } = input;

    await requireActiveTraveller(travellerId);

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
        await assertTargetCanBeSaved("package", packageId);
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

      await assertTargetCanBeSaved("package", packageId);
      let created;
      try {
        created = await WatchlistRepository.create({
          travellerId: new Types.ObjectId(travellerId),
          packageId: new Types.ObjectId(packageId),
          itemType: "package",
        });
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;

        const concurrentSave = await WatchlistRepository.findByTravellerAndPackage(
          new Types.ObjectId(travellerId),
          new Types.ObjectId(packageId)
        );
        if (!concurrentSave) throw error;

        return { saved: true, watchlistItem: toWatchlistItem(concurrentSave, "package") };
      }

      return {
        saved: true,
        watchlistItem: toWatchlistItem(created, "package"),
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
        await assertTargetCanBeSaved("agency", agencyId);
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

      await assertTargetCanBeSaved("agency", agencyId);
      let created;
      try {
        created = await WatchlistRepository.create({
          travellerId: new Types.ObjectId(travellerId),
          agencyId: new Types.ObjectId(agencyId),
          itemType: "agency",
        });
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;

        const concurrentSave = await WatchlistRepository.findByTravellerAndAgency(
          new Types.ObjectId(travellerId),
          new Types.ObjectId(agencyId)
        );
        if (!concurrentSave) throw error;

        return { saved: true, watchlistItem: toWatchlistItem(concurrentSave, "agency") };
      }

      return {
        saved: true,
        watchlistItem: toWatchlistItem(created, "agency"),
      };
    }
  },

  async getWatchlist(filters: WatchlistFilters): Promise<WatchlistListResponse> {
    await requireActiveTraveller(filters.travellerId);
    const result = await WatchlistRepository.findByTraveller(filters);
    const packageIds = result.items
      .filter((item) => item.itemType === "package" && item.packageId)
      .map((item) => item.packageId!);
    const agencyIds = result.items
      .filter((item) => item.itemType === "agency" && item.agencyId)
      .map((item) => item.agencyId!);
    const packages = await PackageRepository.findByIds(packageIds);
    const agencyIdsForSummaries = [
      ...agencyIds,
      ...packages.map((pkg) => String(pkg.agencyId)),
    ];
    const agencies = await AgencyRepository.findApprovedPublicSummariesByIds(
      [...new Set(agencyIdsForSummaries)]
    );
    const packagesById = new Map(packages.map((pkg) => [String(pkg._id), pkg]));
    const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]));
    const now = new Date();

    return {
      ...result,
      items: result.items.map((item) => {
        if (item.itemType === "agency") {
          const agency = item.agencyId ? agenciesById.get(item.agencyId) : undefined;
          return {
            ...item,
            available: Boolean(agency),
            agency: agency ?? null,
          };
        }

        const pkg = item.packageId ? packagesById.get(item.packageId) : undefined;
        const agency = pkg ? agenciesById.get(String(pkg.agencyId)) : undefined;
        const isPublic = Boolean(pkg && pkg.visibility === "public" && agency);
        const isAvailable = Boolean(
          isPublic &&
          pkg?.status === "active" &&
          pkg.availableSeats > 0 &&
          pkg.startDate > now &&
          (!pkg.bookingDeadline || pkg.bookingDeadline >= now)
        );
        return {
          ...item,
          available: isAvailable,
          package: pkg && isPublic && agency
            ? {
                id: String(pkg._id),
                name: pkg.name,
                destination: pkg.destination,
                price: pkg.price,
                currency: pkg.currency,
                priceType: pkg.priceType,
                status: isAvailable ? pkg.status : "unavailable",
                availableSeats: pkg.availableSeats,
                agencyName: agency.name,
                agencySlug: agency.slug,
                agencyLogo: agency.logo,
                imageUrl: pkg.images?.find((image) => image.isPrimary)?.url ?? pkg.images?.[0]?.url,
              }
            : null,
        };
      }),
    };
  },

  async isPackageSaved(travellerId: string, packageId: string): Promise<boolean> {
    await requireActiveTraveller(travellerId);
    if (!Types.ObjectId.isValid(packageId)) throw new ValidationError("Invalid package ID.");
    return WatchlistRepository.isPackageSaved(new Types.ObjectId(travellerId), new Types.ObjectId(packageId));
  },

  async isAgencySaved(travellerId: string, agencyId: string): Promise<boolean> {
    await requireActiveTraveller(travellerId);
    if (!Types.ObjectId.isValid(agencyId)) throw new ValidationError("Invalid agency ID.");
    return WatchlistRepository.isAgencySaved(new Types.ObjectId(travellerId), new Types.ObjectId(agencyId));
  },

  async getWatchlistCount(travellerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(travellerId)) {
      return 0;
    }
    return WatchlistRepository.countByTraveller(new Types.ObjectId(travellerId));
  },
};
