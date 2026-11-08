export type PackageStatus = "draft" | "active" | "sold_out" | "completed" | "cancelled";

export type PackageVisibility = "private" | "public";

export type GeographicScope = "domestic" | "international" | "regional";

export type TripTheme =
  | "honeymoon"
  | "family"
  | "adventure"
  | "pilgrimage"
  | "corporate"
  | "leisure"
  | "weekend"
  | "custom";

export interface PackageItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string[];
  highlights?: string[];
  distance?: string;
}

export interface PackageMeta {
  views?: number;
  inquiries?: number;
  bookings?: number;
}

export interface Destination {
  city: string;
  state?: string;
  country?: string;
  days?: number;
}

export interface PackageImage {
  url: string;
  key: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface TravelPackage {
  id: string;
  agencyId: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description?: string;
  destination: string;
  destinations: Destination[];
  geographicScope: GeographicScope;
  tripTheme: TripTheme;
  durationDays: number;
  durationNights: number;
  startDate: string;
  endDate: string;
  bookingDeadline: string;
  price: number;
  currency: string;
  priceType: "per_person" | "total";
  minTravelers: number;
  maxTravelers?: number;
  availableSeats: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  priceValidUntil?: string;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  images?: PackageImage[];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  status: PackageStatus;
  visibility: PackageVisibility;
  isFeatured: boolean;
  meta?: PackageMeta;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageInput {
  name: string;
  slug: string;
  description?: string;
  destination: string;
  destinations: Destination[];
  geographicScope: GeographicScope;
  tripTheme: TripTheme;
  durationDays: number;
  durationNights: number;
  startDate: string;
  endDate: string;
  bookingDeadline: string;
  price: number;
  currency: string;
  priceType: "per_person" | "total";
  minTravelers: number;
  maxTravelers?: number;
  availableSeats: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  images?: Omit<PackageImage, "createdAt">[];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  visibility?: PackageVisibility;
  isFeatured?: boolean;
}

export interface UpdatePackageInput {
  name?: string;
  slug: string;
  description?: string;
  destination?: string;
  destinations?: Destination[];
  geographicScope?: GeographicScope;
  tripTheme?: TripTheme;
  durationDays?: number;
  durationNights?: number;
  startDate?: string;
  endDate?: string;
  bookingDeadline?: string;
  price?: number;
  currency?: string;
  priceType?: "per_person" | "total";
  minTravelers: number;
  maxTravelers?: number;
  availableSeats?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  images?: Omit<PackageImage, "createdAt">[];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  status?: PackageStatus;
  visibility?: PackageVisibility;
  isFeatured?: boolean;
}

export interface UpdatePackageStatusInput {
  status: PackageStatus;
}

export interface PackageListFilters {
  status?: PackageStatus;
  visibility?: PackageVisibility;
  geographicScope?: GeographicScope;
  tripTheme?: TripTheme;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "startDate" | "endDate" | "price" | "name";
  sortOrder?: "asc" | "desc";
}

export interface PackageListResponse {
  items: TravelPackage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadPackageImagesInput {
  files: Array<{
    key: string;
    mimeType: string;
    size: number;
    altText?: string;
  }>;
}

export interface SetPrimaryImageInput {
  imageId: string;
}

export interface ReorderImagesInput {
  imageIds: string[];
}

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export const GEOGRAPHIC_SCOPE_OPTIONS = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
  { value: "regional", label: "Regional" },
] as const;

export const TRIP_THEME_OPTIONS = [
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family", label: "Family" },
  { value: "adventure", label: "Adventure" },
  { value: "pilgrimage", label: "Pilgrimage" },
  { value: "corporate", label: "Corporate" },
  { value: "leisure", label: "Leisure" },
  { value: "weekend", label: "Weekend" },
  { value: "custom", label: "Custom" },
] as const;

export const PRICE_TYPE_OPTIONS = [
  { value: "total", label: "Total Package Price" },
  { value: "per_person", label: "Per Person" },
] as const;

export const TAX_TYPE_OPTIONS = [
  { value: "inclusive", label: "Tax Inclusive" },
  { value: "exclusive", label: "Tax Exclusive" },
  { value: "none", label: "No Tax" },
] as const;

export const PACKAGE_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "sold_out", label: "Sold Out" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PACKAGE_VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
] as const;

export const PACKAGE_STATUS_COLORS: Record<PackageStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-emerald-100 text-emerald-700",
  sold_out: "bg-orange-100 text-orange-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};