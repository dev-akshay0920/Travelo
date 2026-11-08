import type { PackageFilters } from "@/features/public/types/public-filters.types";
import type { TravelPackage as PublicTravelPackage } from "@/features/public/types/public-filters.types";
import { getApiPath } from "@/lib/api/config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// In-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>();
const pendingRequests = new Map<string, Promise<any>>();

const DEFAULT_TTL = 60000; // 60 seconds

function getCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${prefix}?${sortedParams}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, expires: Date.now() + ttl });
}

function unwrapApiResponse<T>(payload: unknown): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    payload.success === true &&
    "data" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

function buildQueryString(filters: PackageFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

async function fetchWithDeduplication<T>(
  url: string,
  options: RequestInit,
  cacheKey: string,
  ttl = DEFAULT_TTL
): Promise<T> {
  // Check cache first
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  // Check if request is already pending
  const pending = pendingRequests.get(cacheKey);
  if (pending) return pending as Promise<T>;

  // Create new request
  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const payload: unknown = await res.json();
      const data = unwrapApiResponse<T>(payload);
      setCache(cacheKey, data, ttl);
      return data;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, promise);
  return promise;
}

export async function fetchPublicPackages(
  filters: PackageFilters
): Promise<PublicPackageResponse> {
  const query = buildQueryString(filters);
  const cacheKey = getCacheKey("packages", { ...filters, page: filters.page || 1 });
  
  const response = await fetchWithDeduplication<PublicPackageResponse>(
    `${getApiPath("public/packages")}?${query}`,
    { next: { revalidate: 60 }, headers: { "Content-Type": "application/json" } },
    cacheKey,
    60000
  );

  return normalizePublicPackageResponse(response);
}

function normalizePublicPackageResponse(response: PublicPackageResponse): PublicPackageResponse {
  if (!response || !Array.isArray(response.items)) {
    throw new Error("The public packages API returned an invalid response.");
  }

  const items = response.items.map((item) => {
    const rawPackage = item as unknown as Omit<
      PublicTravelPackage,
      "id" | "agencyId" | "agencyName" | "agencySlug" | "agencyLogo"
    > & {
      id?: string;
      _id?: string;
      agencyId: string | {
        _id?: string;
        name?: string;
        slug?: string;
        logo?: { url?: string };
      };
      agencyName?: string;
      agencySlug?: string;
      agencyLogo?: string;
    };
    const id = rawPackage.id || rawPackage._id;

    if (typeof id !== "string" || !id.trim()) {
      throw new Error(`Package "${rawPackage.name || "unknown"}" is missing its database ID.`);
    }

    const agency =
      typeof rawPackage.agencyId === "object" && rawPackage.agencyId !== null
        ? rawPackage.agencyId
        : undefined;

    return {
      ...rawPackage,
      id,
      agencyId:
        typeof rawPackage.agencyId === "string"
          ? rawPackage.agencyId
          : agency?._id ?? "",
      agencyName: rawPackage.agencyName || agency?.name || "",
      agencySlug: rawPackage.agencySlug || agency?.slug || "",
      agencyLogo: rawPackage.agencyLogo || agency?.logo?.url,
    };
  });

  return { ...response, items };
}

export async function fetchPublicAgencies(limit = 8): Promise<{ items: AgencySummary[]; error?: string }> {
  const cacheKey = getCacheKey("agencies", { limit, sort: "popular" });

  try {
    const response = await fetchWithDeduplication<{ items: AgencySummary[] }>(
      `${API_BASE}/public/agencies?limit=${limit}&sort=popular`,
      { next: { revalidate: 300 }, headers: { "Content-Type": "application/json" } },
      cacheKey,
      300000
    );

    if (!Array.isArray(response.items)) {
      throw new Error("The public agencies API returned an invalid response.");
    }

    return response;
  } catch (error) {
    console.error("Failed to load approved agencies from the public API.", error);
    return {
      items: [],
      error: "Agency listings are temporarily unavailable. Please try again later.",
    };
  }
}

export async function fetchDestinations(query: string): Promise<Array<{ city: string; state?: string; country?: string; count: number }>> {
  if (!query || query.length < 2) return [];
  
  const cacheKey = getCacheKey("destinations", { q: query });
  
  return fetchWithDeduplication<Array<{ city: string; state?: string; country?: string; count: number }>>(
    `${API_BASE}/public/destinations?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } },
    cacheKey,
    3600000
  ).catch(() => []);
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const cacheKey = "platform-stats";
  
  return fetchWithDeduplication<PlatformStats>(
    `${API_BASE}/public/stats`,
    { next: { revalidate: 300 }, headers: { "Content-Type": "application/json" } },
    cacheKey,
    300000
  ).catch(() => getDefaultStats());
}

export async function fetchTrustBadges(): Promise<TrustBadge[]> {
  const cacheKey = "trust-badges";
  
  return fetchWithDeduplication<TrustBadge[]>(
    `${API_BASE}/public/trust-badges`,
    { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } },
    cacheKey,
    3600000
  ).catch(() => getDefaultTrustBadges());
}

export async function fetchFeatures(): Promise<FeatureItem[]> {
  const cacheKey = "features";
  
  return fetchWithDeduplication<FeatureItem[]>(
    `${API_BASE}/public/features`,
    { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } },
    cacheKey,
    3600000
  ).catch(() => getDefaultFeatures());
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

export interface PublicPackageResponse {
  items: TravelPackage[];
  total: number;
  page: number;
  totalPages: number;
  facets?: {
    destinations: Array<{ city: string; state?: string; country?: string; count: number }>;
    themes: Array<{ theme: string; count: number }>;
    priceRange: { min: number; max: number };
    durations: { min: number; max: number };
  };
}

export interface PlatformStats {
  verifiedAgencies: number;
  happyTravellers: number;
  totalPackages: number;
  destinations: number;
  avgRating: number;
  totalReviews: number;
}

export interface TrustBadge {
  id: string;
  icon: "shield" | "star" | "credit-card" | "message-square" | "lock" | "settings" | "check-circle";
  title: string;
  description: string;
  color: "blue" | "amber" | "emerald" | "purple" | "green" | "indigo" | "rose";
  order: number;
  isActive: boolean;
}

export interface FeatureItem {
  id: string;
  icon: "search" | "sparkles" | "map-pin" | "message-square" | "star" | "credit-card" | "lock" | "settings" | "shield" | "heart" | "users" | "calendar";
  title: string;
  description: string;
  color: "blue" | "purple" | "amber" | "emerald" | "rose" | "indigo" | "green" | "orange";
  order: number;
  isActive: boolean;
}

function getDefaultStats(): PlatformStats {
  return {
    verifiedAgencies: 500,
    happyTravellers: 50000,
    totalPackages: 2500,
    destinations: 120,
    avgRating: 4.8,
    totalReviews: 15000,
  };
}

function getDefaultTrustBadges(): TrustBadge[] {
  return [
    { id: "1", icon: "shield", title: "Verified Agencies Only", description: "Every agency undergoes KYC verification, license checks, and quality audits before listing.", color: "blue", order: 1, isActive: true },
    { id: "2", icon: "star", title: "Authentic Reviews", description: "Reviews only from verified bookings. No fake ratings, no paid promotions.", color: "amber", order: 2, isActive: true },
    { id: "3", icon: "credit-card", title: "Best Price Guarantee", description: "Found it cheaper elsewhere? We'll match it. Transparent pricing with no hidden fees.", color: "emerald", order: 3, isActive: true },
    { id: "4", icon: "message-square", title: "24/7 Travel Support", description: "Dedicated support before, during, and after your trip. We're here when you need us.", color: "purple", order: 4, isActive: true },
    { id: "5", icon: "lock", title: "Secure Payments", description: "PCI-DSS compliant payment processing. Your financial data is encrypted and protected.", color: "green", order: 5, isActive: true },
    { id: "6", icon: "settings", title: "Customizable Trips", description: "Tailor any package to your preferences. Add experiences, upgrade hotels, extend stays.", color: "indigo", order: 6, isActive: true },
  ];
}

function getDefaultFeatures(): FeatureItem[] {
  return [
    { id: "1", icon: "search", title: "Smart Search", description: "AI-powered recommendations based on your preferences and travel history", color: "blue", order: 1, isActive: true },
    { id: "2", icon: "sparkles", title: "Side-by-Side Compare", description: "Compare packages, prices, and inclusions in one view", color: "purple", order: 2, isActive: true },
    { id: "3", icon: "map-pin", title: "Flexible Dates", description: "Search with flexible dates to find the best deals", color: "amber", order: 3, isActive: true },
    { id: "4", icon: "map-pin", title: "Interactive Maps", description: "Visualize your journey with interactive maps and itineraries", color: "emerald", order: 4, isActive: true },
    { id: "5", icon: "message-square", title: "Direct Chat", description: "Message agencies directly without sharing personal contact info", color: "rose", order: 5, isActive: true },
    { id: "6", icon: "star", title: "Wishlist & Alerts", description: "Save favorite packages and get price drop alerts", color: "indigo", order: 6, isActive: true },
  ];
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
  destinations: Array<{ city: string; state?: string; country?: string; days?: number }>;
  geographicScope: "domestic" | "international" | "regional";
  tripTheme: string;
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
  itinerary?: Array<{ day: number; title: string; description: string; accommodation?: string; meals?: string[]; highlights?: string[]; distance?: string }>;
  images?: Array<{ url: string; altText?: string; isPrimary: boolean; order: number; createdAt: string }>;
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  status: "draft" | "active" | "sold_out" | "completed" | "cancelled";
  visibility?: "private" | "public";
  isFeatured?: boolean;
  meta?: {
    views?: number;
    inquiries?: number;
    bookings?: number;
    rating?: number;
    reviewCount?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}