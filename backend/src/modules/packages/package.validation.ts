import { z } from "zod";

const urlString = z.string().trim().url("Invalid URL.");
const positiveNumber = z.coerce.number().positive("Must be a positive number.");
const nonNegativeNumber = z.coerce.number().min(0, "Must be a non-negative number.");

const currencyCode = z.string().trim().length(3, "Currency code must be 3 characters.").toUpperCase();

const packageItinerarySchema = z.object({
  day: positiveNumber.int(),
  title: z.string().trim().min(1, "Title is required.").max(255),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  meals: z.array(z.string().trim()).max(20).default([]),
  accommodation: z.string().trim().max(255).optional(),
});

const packageImageSchema = z.object({
  url: urlString,
  key: z.string().trim().min(1, "Key is required."),
  altText: z.string().trim().max(120).optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  createdAt: z.coerce.date().optional(),
});

const packageDestinationSchema = z.object({
  city: z.string().trim().min(1, "City is required.").max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  days: positiveNumber.int().max(365).optional(),
});

export const createPackageSchema = z.object({
  name: z.string().trim().min(2, "Package name is required.").max(100),
  slug: z.string().trim().min(6, "Slug must be at least 6 characters.").max(30).regex(/^[a-z][a-z0-9-]+$/, "Slug must start with a letter and can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(1000).optional(),
  destination: z.string().trim().min(2, "Destination is required.").max(100),
  destinations: z.array(packageDestinationSchema).min(1, "At least one destination is required.").max(20),
  geographicScope: z.enum(["domestic", "international", "regional"]),
  tripTheme: z.enum([
    "honeymoon",
    "family",
    "adventure",
    "pilgrimage",
    "corporate",
    "leisure",
    "weekend",
    "custom",
  ]),
  durationDays: positiveNumber.int().max(365),
  durationNights: nonNegativeNumber.int().max(364),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  bookingDeadline: z.coerce.date(),
  price: positiveNumber,
  currency: currencyCode.default("INR"),
  priceType: z.enum(["per_person", "total"]).default("total"),
  minTravelers: positiveNumber.int(),
  maxTravelers: positiveNumber.int().optional(),
  availableSeats: nonNegativeNumber.int(),
  childPolicy: z.string().trim().max(500).optional(),
  infantPolicy: z.string().trim().max(500).optional(),
  taxType: z.enum(["inclusive", "exclusive", "none"]).default("inclusive"),
  taxPercentage: z.coerce.number().min(0).max(100).optional(),
  priceValidUntil: z.coerce.date().optional(),
  advancePercentage: z.coerce.number().min(0).max(100).optional(),
  balanceDueDays: z.coerce.number().min(0).int().optional(),
  inclusions: z.array(z.string().trim()).max(50).optional(),
  exclusions: z.array(z.string().trim()).max(50).optional(),
  itinerary: z.array(packageItinerarySchema).max(60).optional(),
  images: z.array(packageImageSchema).max(10).optional(),
  highlights: z.array(z.string().trim()).max(10).optional(),
  termsAndConditions: z.string().trim().max(5000).optional(),
  cancellationPolicy: z.string().trim().max(5000).optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  isFeatured: z.boolean().optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = createPackageSchema.partial().extend({
  status: z.enum(["draft", "active", "sold_out", "completed", "cancelled"]).optional(),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export const updatePackageStatusSchema = z.object({
  status: z.enum(["draft", "active", "sold_out", "completed", "cancelled"]),
});

export type UpdatePackageStatusInput = z.infer<typeof updatePackageStatusSchema>;

export const uploadPackageImagesSchema = z.object({
  files: z.array(z.object({
    key: z.string().trim().min(1, "Key is required."),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().int().positive().max(5 * 1024 * 1024),
    altText: z.string().trim().max(120).optional(),
  })).min(1, "At least one file is required.").max(5, "Maximum 5 images allowed."),
});

export type UploadPackageImagesInput = z.infer<typeof uploadPackageImagesSchema>;

export const setPrimaryImageSchema = z.object({
  imageId: z.string().trim().min(1, "Image ID is required."),
});

export type SetPrimaryImageInput = z.infer<typeof setPrimaryImageSchema>;

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().trim().min(1)).min(1, "At least one image ID is required."),
});

export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

export const listPackagesQuerySchema = z.object({
  status: z.enum(["draft", "active", "sold_out", "completed", "cancelled"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  geographicScope: z.enum(["domestic", "international", "regional"]).optional(),
  tripTheme: z.enum([
    "honeymoon",
    "family",
    "adventure",
    "pilgrimage",
    "corporate",
    "leisure",
    "weekend",
    "custom",
  ]).optional(),
  search: z.string().trim().max(120).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  endDateFrom: z.coerce.date().optional(),
  endDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(["createdAt", "startDate", "endDate", "price", "name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>;
