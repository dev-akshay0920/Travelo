import type {
  CreatePackageInput,
  UpdatePackageInput,
  PackageListFilters,
  PackageListResponse,
  TravelPackage,
} from "./package.types";
import type { PackageStatus } from "./package.model";
import type { PackageUpdateInput } from "./package.repository";
import { PackageRepository, toTravelPackage } from "./package.repository";
import { NotFoundError, ValidationError, ConflictError } from "../../shared/errors/app-error";
import { slugify } from "../../shared/utils/slugify";
import { Types } from "mongoose";
import { PackageImageStorage } from "./package-image.storage";

function makeSlug(baseName: string): string {
  const base = slugify(baseName).slice(0, 8);
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return `${base}-${suffix}`.slice(0, 50);
}

function validateDates(startDate: Date, endDate: Date, bookingDeadline?: Date) {
  if (startDate >= endDate) {
    throw new ValidationError("Start date must be before end date.");
  }

  if (bookingDeadline && bookingDeadline > startDate) {
    throw new ValidationError("Booking deadline must be before or equal to the start date.");
  }
}

type PackageServiceImageInput = {
  url: string;
  key?: string;
  altText?: string;
  isPrimary?: boolean;
  order?: number;
  createdAt?: Date;
};

export interface CreatePackageServiceInput extends Omit<CreatePackageInput, "agencyId" | "ownerUserId" | "images"> {
  agencyId: string;
  ownerUserId: string;
  images?: PackageServiceImageInput[];
}

export interface UpdatePackageServiceInput extends Omit<UpdatePackageInput, "id" | "agencyId" | "images"> {
  id: string;
  agencyId: string;
  images?: PackageServiceImageInput[];
}

export interface UploadPackageImagesInput {
  packageId: string;
  agencyId: string;
  files: Array<{
    key: string;
    mimeType: string;
    size: number;
    altText?: string;
  }>;
}

export interface DeletePackageImageInput {
  packageId: string;
  agencyId: string;
  imageKey: string;
}

export interface SetPrimaryImageInput {
  packageId: string;
  agencyId: string;
  imageKey: string;
}

export interface ReorderImagesInput {
  packageId: string;
  agencyId: string;
  imageKeys: string[];
}

export const PackageService = {
  async createPackage(input: CreatePackageServiceInput): Promise<TravelPackage> {
    const {
      agencyId,
      ownerUserId,
      name,
      slug: providedSlug,
      description,
      destination,
      destinations,
      geographicScope,
      tripTheme,
      durationDays,
      durationNights,
      startDate,
      endDate,
      bookingDeadline,
      price,
      currency,
      priceType,
      minTravelers,
      maxTravelers,
      availableSeats,
      childPolicy,
      infantPolicy,
      taxType,
      taxPercentage,
      priceValidUntil,
      advancePercentage,
      balanceDueDays,
      inclusions,
      exclusions,
      itinerary,
      images,
      highlights,
      termsAndConditions,
      cancellationPolicy,
      visibility,
      isFeatured,
    } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    if (!Types.ObjectId.isValid(ownerUserId)) {
      throw new ValidationError("Invalid user ID.");
    }

    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const deadline = bookingDeadline instanceof Date ? bookingDeadline : new Date(bookingDeadline);

    validateDates(start, end, deadline);

    const safeMinTravelers = minTravelers ?? 1;
    if (safeMinTravelers < 1) {
      throw new ValidationError("Min travelers must be at least 1.");
    }
    if (maxTravelers !== undefined && maxTravelers < safeMinTravelers) {
      throw new ValidationError("Max travelers cannot be less than min travelers.");
    }
    if (availableSeats < 0) {
      throw new ValidationError("Available seats cannot be negative.");
    }
    if (taxPercentage !== undefined && (taxPercentage < 0 || taxPercentage > 100)) {
      throw new ValidationError("Tax percentage must be between 0 and 100.");
    }
    if (advancePercentage !== undefined && (advancePercentage < 0 || advancePercentage > 100)) {
      throw new ValidationError("Advance percentage must be between 0 and 100.");
    }
    if (balanceDueDays !== undefined && balanceDueDays < 0) {
      throw new ValidationError("Balance due days cannot be negative.");
    }

    let slug = providedSlug?.trim();
    if (!slug) {
      slug = makeSlug(name);
    } else {
      slug = slugify(slug).slice(0, 30);
    }

    const existing = await PackageRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError("A package with this slug already exists.");
    }

    const data: Parameters<typeof PackageRepository.create>[0] = {
      agencyId: new Types.ObjectId(agencyId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      name: name.trim(),
      slug,
      description: description?.trim(),
      destination: destination.trim(),
      destinations: destinations?.map((d) => ({
        city: d.city.trim(),
        state: d.state?.trim(),
        country: d.country?.trim(),
        days: d.days,
      })),
      geographicScope,
      tripTheme,
      durationDays,
      durationNights,
      startDate: start,
      endDate: end,
      bookingDeadline: deadline,
      price,
      currency: currency || "INR",
      priceType: priceType || "total",
      minTravelers: minTravelers || 1,
      maxTravelers,
      availableSeats,
      childPolicy: childPolicy?.trim(),
      infantPolicy: infantPolicy?.trim(),
      taxType: taxType || "inclusive",
      taxPercentage,
      priceValidUntil: priceValidUntil ? new Date(priceValidUntil) : undefined,
      advancePercentage,
      balanceDueDays,
      inclusions: inclusions?.map((item) => item.trim()).filter(Boolean),
      exclusions: exclusions?.map((item) => item.trim()).filter(Boolean),
      itinerary: itinerary?.map((day) => ({
        day: day.day,
        title: day.title.trim(),
        description: day.description.trim(),
        meals: day.meals?.map((m) => m.trim()).filter(Boolean),
        accommodation: day.accommodation?.trim(),
      })),
      images: images?.map((img) => ({
        url: img.url.trim(),
        key: (img as { key?: string }).key?.trim() || "",
        altText: img.altText?.trim(),
        isPrimary: img.isPrimary ?? false,
        order: (img as { order?: number }).order ?? 0,
        createdAt: new Date(),
      })) as Parameters<typeof PackageRepository.create>[0]["images"],
      highlights: highlights?.map((h) => h.trim()).filter(Boolean),
      termsAndConditions: termsAndConditions?.trim(),
      cancellationPolicy: cancellationPolicy?.trim(),
      visibility: visibility || "private",
      isFeatured: isFeatured ?? false,
    };

    const pkg = await PackageRepository.create(data);

    const doc = await PackageRepository.findById(String(pkg._id));
    if (!doc) {
      throw new NotFoundError("Failed to load created package.");
    }

    return toTravelPackage(doc);
  },

  async getPackageById(id: string, agencyId: string): Promise<TravelPackage> {
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const doc = await PackageRepository.findById(id);
    if (!doc || String(doc.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(doc);
  },

  async getPackagesByAgency(agencyId: string, filters: PackageListFilters): Promise<PackageListResponse> {
    console.log("[getPackagesByAgency] agencyId:", agencyId, "filters:", filters);
    if (!Types.ObjectId.isValid(agencyId)) {
      console.log("[getPackagesByAgency] Invalid agencyId");
      return { items: [], total: 0, page: 1, limit: filters.limit || 10, totalPages: 0 };
    }

    return PackageRepository.findByAgencyIdWithFilters(agencyId, filters);
  },

  async getUpcomingPackages(agencyId: string): Promise<TravelPackage[]> {
    console.log("[getUpcomingPackages] agencyId:", agencyId);
    const docs = await PackageRepository.findUpcoming(agencyId);
    console.log("[getUpcomingPackages] found:", docs.length);
    return docs.map(toTravelPackage);
  },

  async getCurrentPackages(agencyId: string): Promise<TravelPackage[]> {
    console.log("[getCurrentPackages] agencyId:", agencyId);
    const docs = await PackageRepository.findCurrent(agencyId);
    console.log("[getCurrentPackages] found:", docs.length);
    return docs.map(toTravelPackage);
  },

  async getHistoryPackages(agencyId: string): Promise<TravelPackage[]> {
    console.log("[getHistoryPackages] agencyId:", agencyId);
    const docs = await PackageRepository.findHistory(agencyId);
    console.log("[getHistoryPackages] found:", docs.length);
    return docs.map(toTravelPackage);
  },

  async updatePackage(input: UpdatePackageServiceInput): Promise<TravelPackage> {
    const { id, agencyId, images, ...updates } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const payload: UpdatePackageInput = { ...updates };

    if (payload.slug !== undefined && payload.slug !== null) {
      payload.slug = payload.slug.trim().toLowerCase();
      const slugExists = await PackageRepository.findBySlug(payload.slug);
      if (slugExists && String(slugExists._id) !== id) {
        throw new ConflictError("A package with this slug already exists.");
      }
    }

    if (payload.startDate || payload.endDate) {
      const start = payload.startDate instanceof Date ? payload.startDate : payload.startDate ? new Date(payload.startDate) : existing.startDate;
      const end = payload.endDate instanceof Date ? payload.endDate : payload.endDate ? new Date(payload.endDate) : existing.endDate;
      validateDates(start, end, payload.bookingDeadline instanceof Date ? payload.bookingDeadline : payload.bookingDeadline ? new Date(payload.bookingDeadline) : existing.bookingDeadline);
    }

    if (payload.availableSeats !== undefined) {
      const available = payload.availableSeats ?? existing.availableSeats;
      if (available < 0) {
        throw new ValidationError("Available seats cannot be negative.");
      }
    }

    if (payload.maxTravelers !== undefined && payload.minTravelers !== undefined && payload.maxTravelers < payload.minTravelers) {
      throw new ValidationError("Max travelers cannot be less than min travelers.");
    }

    const normalizedPayload: PackageUpdateInput = {
      ...payload,
      ...(images !== undefined
        ? {
            images: images.map((image) => ({
              url: image.url.trim(),
              key: image.key?.trim() || "",
              altText: image.altText?.trim(),
              isPrimary: image.isPrimary ?? false,
              order: image.order ?? 0,
              createdAt: image.createdAt ?? new Date(),
            })),
          }
        : {}),
      ...(payload.startDate !== undefined && payload.startDate !== null
        ? { startDate: payload.startDate instanceof Date ? payload.startDate : new Date(payload.startDate) }
        : {}),
      ...(payload.endDate !== undefined && payload.endDate !== null
        ? { endDate: payload.endDate instanceof Date ? payload.endDate : new Date(payload.endDate) }
        : {}),
      ...(payload.bookingDeadline !== undefined && payload.bookingDeadline !== null
        ? { bookingDeadline: payload.bookingDeadline instanceof Date ? payload.bookingDeadline : new Date(payload.bookingDeadline) }
        : {}),
      ...(payload.priceValidUntil !== undefined && payload.priceValidUntil !== null
        ? { priceValidUntil: payload.priceValidUntil instanceof Date ? payload.priceValidUntil : new Date(payload.priceValidUntil) }
        : {}),
    } as PackageUpdateInput;

    const updated = await PackageRepository.update(id, normalizedPayload);
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(updated);
  },

  async updatePackageStatus(id: string, agencyId: string, status: PackageStatus): Promise<TravelPackage> {
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const allowedTransitions: Record<PackageStatus, PackageStatus[]> = {
      draft: ["active", "cancelled"],
      active: ["sold_out", "completed", "cancelled"],
      sold_out: ["active"],
      completed: [],
      cancelled: [],
    };

    const current = existing.status;
    if (!allowedTransitions[current]?.includes(status)) {
      throw new ValidationError(`Cannot transition package from ${current} to ${status}.`);
    }

    const updated = await PackageRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(updated);
  },

  async deletePackage(id: string, agencyId: string): Promise<void> {
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    await PackageRepository.clearImages(id);

    const deleted = await PackageRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("Package not found.");
    }
  },

  async uploadPackageImages(input: UploadPackageImagesInput): Promise<TravelPackage> {
    const { packageId, agencyId, files } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(packageId);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const maxImages = PackageImageStorage.getMaxImages();
    const currentImageCount = existing.images?.length || 0;
    const newImageCount = files.length;

    if (currentImageCount + newImageCount > maxImages) {
      throw new ValidationError(`Maximum ${maxImages} images allowed per package. Currently has ${currentImageCount}.`);
    }

    for (const file of files) {
      validateFile(file);
    }

    const imagesToAdd = files.map((file, index) => ({
      url: PackageImageStorage.getPublicUrl(file.key),
      key: file.key,
      altText: file.altText,
      isPrimary: currentImageCount === 0 && index === 0,
      order: currentImageCount + index,
    }));

    const updated = await PackageRepository.addImages({ packageId, images: imagesToAdd });
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(updated);
  },

  async deletePackageImage(input: DeletePackageImageInput): Promise<TravelPackage> {
    const { packageId, agencyId, imageKey } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(packageId);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const image = existing.images?.find((img) => img.key === imageKey);
    if (!image) {
      throw new NotFoundError("Image not found.");
    }

    const wasPrimary = image.isPrimary;

    const updated = await PackageRepository.removeImage(packageId, imageKey);
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    if (PackageImageStorage.isConfigured()) {
      await PackageImageStorage.deleteImage(imageKey);
    }

    if (wasPrimary && updated.images && updated.images.length > 0 && updated.images[0]?.key) {
      await PackageRepository.setPrimaryImage(packageId, updated.images[0].key!);
      const refreshed = await PackageRepository.findById(packageId);
      if (refreshed) {
        return toTravelPackage(refreshed);
      }
    }

    return toTravelPackage(updated);
  },

  async setPrimaryImage(input: SetPrimaryImageInput): Promise<TravelPackage> {
    const { packageId, agencyId, imageKey } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(packageId);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const image = existing.images?.find((img) => img.key === imageKey);
    if (!image) {
      throw new NotFoundError("Image not found.");
    }

    const updated = await PackageRepository.setPrimaryImage(packageId, imageKey);
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(updated);
  },

  async reorderImages(input: ReorderImagesInput): Promise<TravelPackage> {
    const { packageId, agencyId, imageKeys } = input;

    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(packageId);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const existingKeys = existing.images?.map((img) => img.key) || [];
    const hasAllKeys = imageKeys.every((key) => existingKeys.includes(key));
    if (!hasAllKeys || imageKeys.length !== existingKeys.length) {
      throw new ValidationError("Invalid image order. All images must be included.");
    }

    const updated = await PackageRepository.reorderImages(packageId, imageKeys);
    if (!updated) {
      throw new NotFoundError("Package not found.");
    }

    return toTravelPackage(updated);
  },

  async getPresignedUploadUrl(packageId: string, agencyId: string, mimeType: string, fileName: string): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }

    const existing = await PackageRepository.findById(packageId);
    if (!existing) {
      throw new NotFoundError("Package not found.");
    }

    if (String(existing.agencyId) !== agencyId) {
      throw new NotFoundError("Package not found.");
    }

    const currentImageCount = existing.images?.length || 0;
    const maxImages = PackageImageStorage.getMaxImages();
    if (currentImageCount >= maxImages) {
      throw new ValidationError(`Maximum ${maxImages} images allowed per package.`);
    }

    if (!PackageImageStorage.getAllowedMimeTypes().includes(mimeType)) {
      throw new ValidationError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
    }

    return PackageImageStorage.generatePresignedUploadUrl(packageId, mimeType, fileName);
  },
};

function validateFile(file: { mimeType: string; size: number }) {
  const allowedTypes = PackageImageStorage.getAllowedMimeTypes();
  if (!allowedTypes.includes(file.mimeType)) {
    throw new ValidationError(`Invalid file type. Allowed: ${allowedTypes.join(", ")}.`);
  }

  const maxSize = PackageImageStorage.getMaxFileSize();
  if (file.size > maxSize) {
    throw new ValidationError(`File size must be ${maxSize / (1024 * 1024)}MB or smaller.`);
  }
}