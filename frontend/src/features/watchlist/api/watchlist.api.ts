import { apiClient } from "@/lib/api/client";

export interface WatchlistItem {
  id: string;
  packageId?: string;
  agencyId?: string;
  itemType: "package" | "agency";
  available?: boolean;
  package?: {
    id: string;
    name: string;
    destination: string;
    price: number;
    currency: string;
    priceType: string;
    status: string;
    availableSeats: number;
    agencyName: string;
    agencySlug: string;
    agencyLogo?: string;
    imageUrl?: string;
  } | null;
  agency?: {
    id: string;
    name: string;
    slug: string;
    destination: string;
    logo?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ToggleWatchlistResult {
  saved: boolean;
  watchlistItem?: WatchlistItem;
}

export interface IsSavedResult {
  saved: boolean;
}

export interface SavedStatusResponse {
  packageIds: string[];
  agencyIds: string[];
}

export const watchlistApi = {
  async savedStatus(input: {
    packageIds: string[];
    agencyIds: string[];
  }): Promise<SavedStatusResponse> {
    const data = await apiClient.post<{ data: SavedStatusResponse }>(
      "/watchlist/saved-status",
      { body: input }
    );
    return data.data;
  },

  async toggle({
    packageId,
    agencyId,
    itemType,
  }: {
    packageId?: string;
    agencyId?: string;
    itemType: "package" | "agency";
  }): Promise<ToggleWatchlistResult> {
    const data = await apiClient.post<{ data: ToggleWatchlistResult }>(
      "/watchlist/toggle",
      { body: { packageId, agencyId, itemType } }
    );
    return data.data;
  },

  async list({
    page = 1,
    limit = 10,
    itemType,
  }: {
    page?: number;
    limit?: number;
    itemType?: "package" | "agency";
  } = {}): Promise<WatchlistResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (itemType) params.set("itemType", itemType);
    const data = await apiClient.get<{ data: WatchlistResponse }>(
      `/watchlist?${params.toString()}`
    );
    return data.data;
  },

  async isSavedPackage(packageId: string): Promise<IsSavedResult> {
    const data = await apiClient.get<{ data: IsSavedResult }>(
      `/watchlist/${encodeURIComponent(packageId)}/saved`
    );
    return data.data;
  },

  async isSavedAgency(agencyId: string): Promise<IsSavedResult> {
    const data = await apiClient.get<{ data: IsSavedResult }>(
      `/watchlist/agency/${encodeURIComponent(agencyId)}/saved`
    );
    return data.data;
  },
};
