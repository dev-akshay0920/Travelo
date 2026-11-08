import { Types } from "mongoose";
import type { PackageDocument, PackageStatus, PackageVisibility } from "./package.model";
import { Package } from "./package.model";
import type { PackageListFilters, PackageListResponse, TravelPackage } from "./package.types";
import { PackageImageStorage } from "./package-image.storage";

export interface PackageCreateInput {
  agencyId: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  destination: string;
  destinations: PackageDocument["destinations"];
  geographicScope: string;
  tripTheme: string;
  durationDays: number;
  durationNights: number;
  startDate: Date;
  endDate: Date;
  bookingDeadline: Date;
  price: number;
  currency?: string;
  priceType?: string;
  minTravelers?: number;
  maxTravelers?: number;
  availableSeats: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType?: string;
  taxPercentage?: number;
  priceValidUntil?: Date;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageDocument["itinerary"];
  images?: PackageDocument["images"];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  visibility?: PackageVisibility;
  isFeatured?: boolean;
}

export interface PackageUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  destination?: string;
  destinations?: PackageDocument["destinations"];
  geographicScope?: string;
  tripTheme?: string;
  durationDays?: number;
  durationNights?: number;
  startDate?: Date;
  endDate?: Date;
  bookingDeadline?: Date;
  price?: number;
  currency?: string;
  priceType?: string;
  minTravelers?: number;
  maxTravelers?: number;
  availableSeats?: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType?: string;
  taxPercentage?: number;
  priceValidUntil?: Date;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageDocument["itinerary"];
  images?: PackageDocument["images"];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  status?: PackageStatus;
  visibility?: PackageVisibility;
  isFeatured?: boolean;
}

export interface AddImagesInput {
  packageId: string;
  images: Array<{
    url: string;
    key: string;
    altText?: string;
    isPrimary?: boolean;
    order?: number;
  }>;
}

interface PackageImage {
  url: string;
  key: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}

export function toTravelPackage(doc: PackageDocument): TravelPackage {
  return {
    id: String(doc._id),
    agencyId: String(doc.agencyId),
    ownerUserId: String(doc.ownerUserId),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    destination: doc.destination,
    destinations: doc.destinations,
    geographicScope: doc.geographicScope,
    tripTheme: doc.tripTheme,
    durationDays: doc.durationDays,
    durationNights: doc.durationNights,
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate.toISOString(),
    bookingDeadline: doc.bookingDeadline?.toISOString() || "",
    price: doc.price,
    currency: doc.currency,
    priceType: doc.priceType || "total",
    minTravelers: doc.minTravelers || 1,
    maxTravelers: doc.maxTravelers,
    availableSeats: doc.availableSeats,
    childPolicy: doc.childPolicy,
    infantPolicy: doc.infantPolicy,
    taxType: doc.taxType || "inclusive",
    taxPercentage: doc.taxPercentage,
    priceValidUntil: doc.priceValidUntil?.toISOString(),
    advancePercentage: doc.advancePercentage,
    balanceDueDays: doc.balanceDueDays,
    inclusions: doc.inclusions,
    exclusions: doc.exclusions,
    itinerary: doc.itinerary,
    images: doc.images,
    highlights: doc.highlights,
    termsAndConditions: doc.termsAndConditions,
    cancellationPolicy: doc.cancellationPolicy,
    status: doc.status,
    visibility: doc.visibility,
    isFeatured: doc.isFeatured,
    meta: doc.meta,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function buildQuery(filters: PackageListFilters) {
  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.visibility) {
    query.visibility = filters.visibility;
  }

  if (filters.geographicScope) {
    query.geographicScope = filters.geographicScope;
  }

  if (filters.tripTheme) {
    query.tripTheme = filters.tripTheme;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { destination: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.startDateFrom || filters.startDateTo) {
    query.startDate = {};
    if (filters.startDateFrom) {
      (query.startDate as Record<string, unknown>).$gte = new Date(filters.startDateFrom);
    }
    if (filters.startDateTo) {
      (query.startDate as Record<string, unknown>).$lte = new Date(filters.startDateTo);
    }
  }

  if (filters.endDateFrom || filters.endDateTo) {
    query.endDate = {};
    if (filters.endDateFrom) {
      (query.endDate as Record<string, unknown>).$gte = new Date(filters.endDateFrom);
    }
    if (filters.endDateTo) {
      (query.endDate as Record<string, unknown>).$lte = new Date(filters.endDateTo);
    }
  }

  return query;
}

function buildSort(filters: PackageListFilters) {
  const sortField = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  return { [sortField]: sortOrder };
}

export const PackageRepository = {
  async findById(id: string): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Package.findById(id).exec();
  },

  async findByAgencyId(agencyId: string): Promise<PackageDocument[]> {
    if (!Types.ObjectId.isValid(agencyId)) {
      return [];
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Package.find({ agencyId }).sort({ createdAt: -1 }).exec();
  },

  async findByAgencyIdWithFilters(
    agencyId: string,
    filters: PackageListFilters
  ): Promise<PackageListResponse> {
    console.log("[findByAgencyIdWithFilters] agencyId:", agencyId, "filters:", filters);
    if (!Types.ObjectId.isValid(agencyId)) {
      console.log("[findByAgencyIdWithFilters] Invalid agencyId");
      return { items: [], total: 0, page: 1, limit: filters.limit || 10, totalPages: 0 };
    }

    const query = buildQuery(filters);
    query.agencyId = agencyId;
    console.log("[findByAgencyIdWithFilters] MongoDB query:", JSON.stringify(query));

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Package.find(query).sort(buildSort(filters)).skip(skip).limit(limit).exec(),
      Package.countDocuments(query).exec(),
    ]);

    console.log("[findByAgencyIdWithFilters] Found items:", items.length, "total:", total);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map(toTravelPackage),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async findBySlug(slug: string): Promise<PackageDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Package.findOne({ slug: slug.toLowerCase() }).exec();
  },

  async findUpcoming(agencyId: string): Promise<PackageDocument[]> {
    console.log("[findUpcoming] agencyId:", agencyId);
    if (!Types.ObjectId.isValid(agencyId)) {
      console.log("[findUpcoming] Invalid agencyId");
      return [];
    }
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const docs = await Package.find({
      agencyId,
      status: { $in: ["draft", "active"] },
      startDate: { $gt: now },
    }).sort({ startDate: 1 }).exec();
    console.log("[findUpcoming] found:", docs.length);
    return docs;
  },

  async findCurrent(agencyId: string): Promise<PackageDocument[]> {
    console.log("[findCurrent] agencyId:", agencyId);
    if (!Types.ObjectId.isValid(agencyId)) {
      console.log("[findCurrent] Invalid agencyId");
      return [];
    }
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const docs = await Package.find({
      agencyId,
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ endDate: 1 }).exec();
    console.log("[findCurrent] found:", docs.length);
    return docs;
  },

  async findHistory(agencyId: string): Promise<PackageDocument[]> {
    console.log("[findHistory] agencyId:", agencyId);
    if (!Types.ObjectId.isValid(agencyId)) {
      console.log("[findHistory] Invalid agencyId");
      return [];
    }
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const docs = await Package.find({
      agencyId,
      $or: [
        { endDate: { $lt: now } },
        { status: { $in: ["completed", "cancelled", "sold_out"] } },
      ],
    }).sort({ endDate: -1 }).exec();
    console.log("[findHistory] found:", docs.length);
    return docs;
  },

  async create(data: PackageCreateInput): Promise<PackageDocument> {
    const pkg = new Package(data);
    return pkg.save();
  },

  async update(id: string, data: PackageUpdateInput): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async updateStatus(id: string, status: PackageStatus): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async deleteById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await (Package as unknown as { deleteOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ deletedCount: number }> } }).deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  },

  async countByAgency(agencyId: string): Promise<number> {
    if (!Types.ObjectId.isValid(agencyId)) {
      return 0;
    }
    return Package.countDocuments({ agencyId }).exec();
  },

  async addImages(input: AddImagesInput): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(input.packageId)) {
      return null;
    }
    const imagesWithDefaults = input.images.map((img, index) => ({
      ...img,
      isPrimary: img.isPrimary ?? false,
      order: img.order ?? index,
      createdAt: new Date(),
    }));

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(
      input.packageId,
      { $push: { images: { $each: imagesWithDefaults } } },
      { new: true }
    ).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async removeImage(packageId: string, imageKey: string): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(
      packageId,
      { $pull: { images: { key: imageKey } } },
      { new: true }
    ).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async setPrimaryImage(packageId: string, imageKey: string): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // First, unset all primary images
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    await Package.findByIdAndUpdate(
      packageId,
      { $set: { "images.$[elem].isPrimary": false } },
      { arrayFilters: [{ "elem.isPrimary": true }] }
    ).exec();

    // Then set the new primary image
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(
      packageId,
      { $set: { "images.$[elem].isPrimary": true } },
      { arrayFilters: [{ "elem.key": imageKey }], new: true }
    ).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async reorderImages(packageId: string, imageKeys: string[]): Promise<PackageDocument | null> {
    if (!Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const pkg = await Package.findById(packageId).exec();
    if (!pkg) {
      return null;
    }

    const updatedImages = pkg.images.map((img: PackageImage) => {
      const newOrder = imageKeys.indexOf(img.key);
      return newOrder >= 0 ? { ...img, order: newOrder } : img;
    }).sort((a: PackageImage, b: PackageImage) => a.order - b.order);

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Package.findByIdAndUpdate(
      packageId,
      { $set: { images: updatedImages } },
      { new: true }
    ).exec();
    return updated as Promise<PackageDocument | null>;
  },

  async clearImages(packageId: string): Promise<void> {
    if (!Types.ObjectId.isValid(packageId)) {
      return;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const pkg = await Package.findById(packageId).exec();
    if (pkg && pkg.images.length > 0) {
      if (PackageImageStorage.isConfigured()) {
        await PackageImageStorage.deleteImages(pkg.images.map((img: PackageImage) => img.key));
      }
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    await Package.findByIdAndUpdate(packageId, { $set: { images: [] } }).exec();
  },
};