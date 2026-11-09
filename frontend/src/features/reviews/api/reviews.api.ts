import { apiClient } from "@/lib/api/client";

export interface ReviewDTO {
  id: string;
  travellerId: string;
  packageId: string;
  agencyId: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewsResponse {
  items: ReviewDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubmitReviewInput {
  packageId: string;
  agencyId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  async submit(input: SubmitReviewInput): Promise<{ review: ReviewDTO }> {
    const data = await apiClient.post<{ data: { review: ReviewDTO } }>(
      "/reviews",
      { body: input }
    );
    return data.data;
  },

  async list(packageId?: string, agencyId?: string, page = 1, limit = 20): Promise<ReviewsResponse> {
    const params = new URLSearchParams();
    if (packageId) params.set("packageId", packageId);
    if (agencyId) params.set("agencyId", agencyId);
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("status", "approved");

    const data = await apiClient.get<{ data: ReviewsResponse }>(
      `/reviews?${params.toString()}`
    );
    return data.data;
  },

  async stats(packageId?: string, agencyId?: string): Promise<ReviewStats> {
    const params = new URLSearchParams();
    if (packageId) params.set("packageId", packageId);
    if (agencyId) params.set("agencyId", agencyId);

    const data = await apiClient.get<{ data: ReviewStats }>(
      `/reviews/stats?${params.toString()}`
    );
    return data.data;
  },

  async update(id: string, rating?: number, comment?: string): Promise<{ review: ReviewDTO }> {
    const data = await apiClient.patch<{ data: { review: ReviewDTO } }>(
      `/reviews/${encodeURIComponent(id)}`,
      { body: { ...(rating !== undefined && { rating }), ...(comment !== undefined && { comment }) } }
    );
    return data.data;
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    const data = await apiClient.delete<{ data: { deleted: boolean } }>(
      `/reviews/${encodeURIComponent(id)}`
    );
    return data.data;
  },
};
