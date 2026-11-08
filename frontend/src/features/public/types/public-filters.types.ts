export type TripTheme =
  | "honeymoon"
  | "family"
  | "adventure"
  | "pilgrimage"
  | "corporate"
  | "leisure"
  | "weekend"
  | "custom";

export type GeographicScope = "domestic" | "international" | "regional";

export type PackageStatus = "draft" | "active" | "sold_out" | "completed" | "cancelled";

export type PackageVisibility = "private" | "public";

export type SortOption =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "popular"
  | "ending_soon";

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
  rating?: number;
  reviewCount?: number;
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
  agencyName: string;
  agencySlug: string;
  agencyLogo?: string;
  ownerUserId?: string;
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
  taxType?: "inclusive" | "exclusive" | "none";
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
  visibility?: PackageVisibility;
  isFeatured?: boolean;
  meta?: PackageMeta;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageFilters {
  destination?: string;
  destinations?: string[];
  theme?: TripTheme[];
  priceMin?: number;
  priceMax?: number;
  startDate?: string;
  endDate?: string;
  flexibleDates?: boolean;
  adults?: number;
  children?: number;
  infants?: number;
  durationMin?: number;
  durationMax?: number;
  geographicScope?: GeographicScope;
  status?: PackageStatus[];
  sortBy?: SortOption;
  page?: number;
  limit?: number;
  agencySlug?: string;
}

export interface PackageFacetCounts {
  destinations: Array<{ city: string; state?: string; country?: string; count: number }>;
  themes: Array<{ theme: TripTheme; count: number }>;
  priceRange: { min: number; max: number };
  durations: { min: number; max: number };
}

export interface PublicPackageResponse {
  items: TravelPackage[];
  total: number;
  page: number;
  totalPages: number;
  facets?: PackageFacetCounts;
}

export interface AgencySummary {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  destination: string;
  rating?: number;
  reviewCount?: number;
  packageCount: number;
}

export const TRIP_THEME_LABELS: Record<TripTheme, string> = {
  honeymoon: "Honeymoon",
  family: "Family",
  adventure: "Adventure",
  pilgrimage: "Pilgrimage",
  corporate: "Corporate",
  leisure: "Leisure",
  weekend: "Weekend",
  custom: "Custom",
};

export const TRIP_THEME_ICONS: Record<TripTheme, string> = {
  honeymoon: "heart",
  family: "users",
  adventure: "mountain",
  pilgrimage: "church",
  corporate: "briefcase",
  leisure: "sun",
  weekend: "calendar",
  custom: "sparkles",
};

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "ending_soon", label: "Ending Soon" },
];

export const DURATION_PRESETS = [
  { label: "1-3 Days", min: 1, max: 3 },
  { label: "4-6 Days", min: 4, max: 6 },
  { label: "7-10 Days", min: 7, max: 10 },
  { label: "10+ Days", min: 11, max: 999 },
];

export const PRICE_PRESETS = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
  { label: "₹1,00,000+", min: 100000, max: Infinity },
];