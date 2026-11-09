import { apiClient } from "@/lib/api/client";

export interface WatchlistItem {
  id: string;
  packageId: string;
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
  async toggle(packageId: string): Promise<ToggleWatchlistResult> {
    const data = await apiClient.post<{ data: ToggleWatchlistResult }>(
      "/watchlist/toggle",
      { body: { packageId } }
    );
    return data.data;
  },

  async list(page = 1, limit = 10): Promise<WatchlistResponse> {
    const data = await apiClient.get<{ data: WatchlistResponse }>(
      `/watchlist?page=${page}&limit=${limit}`
    );
    return data.data;
  },

  async isSaved(packageId: string): Promise<IsSavedResult> {
    const data = await apiClient.get<{ data: IsSavedResult }>(
      `/watchlist/${encodeURIComponent(packageId)}/saved`
    );
    return data.data;
  },
};
