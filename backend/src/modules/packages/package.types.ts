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
  images?: {
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }[];
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
  agencyId: string;
  ownerUserId: string;
  name: string;
  slug?: string;
  description?: string;
  destination: string;
  destinations: Destination[];
  geographicScope: GeographicScope;
  tripTheme: TripTheme;
  durationDays: number;
  durationNights: number;
  startDate: string | Date;
  endDate: string | Date;
  bookingDeadline: string | Date;
  price: number;
  currency?: string;
  priceType?: "per_person" | "total";
  minTravelers?: number;
  maxTravelers?: number;
  availableSeats: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType?: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  priceValidUntil?: string | Date;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  images?: {
    url: string;
    altText?: string;
    isPrimary: boolean;
  }[];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  visibility?: PackageVisibility;
  isFeatured?: boolean;
}

export interface UpdatePackageInput {
  name?: string;
  slug?: string;
  description?: string;
  destination?: string;
  destinations?: Destination[];
  geographicScope?: GeographicScope;
  tripTheme?: TripTheme;
  durationDays?: number;
  durationNights?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  bookingDeadline?: string | Date;
  price?: number;
  currency?: string;
  priceType?: "per_person" | "total";
  minTravelers?: number;
  maxTravelers?: number;
  availableSeats?: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType?: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  priceValidUntil?: string | Date;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  images?: {
    url: string;
    altText?: string;
    isPrimary: boolean;
  }[];
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
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
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

export type ListPackagesQuery = PackageListFilters;
