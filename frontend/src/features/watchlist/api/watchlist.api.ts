import { apiClient } from "@/lib/api/client";

export interface WatchlistItem {
  id: string;
  packageId?: string;
  agencyId?: string;
  itemType: "package" | "agency";
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

export const watchlistApi = {
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
