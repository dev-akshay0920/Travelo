import { apiClient } from "@/lib/api";
import type { LeadSource, LeadSourceListResponse } from "@/features/leads/types/lead.types";

export async function getLeadSourcesApi(filters: {
  page: number;
  limit: number;
  isActive?: boolean;
}): Promise<LeadSourceListResponse> {
  const response = await apiClient.get<{
    success: true;
    data: LeadSourceListResponse;
  }>("/leads/sources", { query: filters });
  return response.data;
}

export async function createLeadSourceApi(input: {
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  costPerLead?: number;
  isActive?: boolean;
}): Promise<LeadSource> {
  const response = await apiClient.post<{ success: true; data: { source: LeadSource } }>(
    "/leads/sources",
    { body: input },
  );
  return response.data.source;
}

export async function updateLeadSourceApi(
  id: string,
  input: Partial<{
    name: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    costPerLead: number;
    isActive: boolean;
  }>,
): Promise<LeadSource> {
  const response = await apiClient.patch<{ success: true; data: { source: LeadSource } }>(
    `/leads/sources/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.source;
}

export async function deleteLeadSourceApi(id: string): Promise<void> {
  await apiClient.delete(`/leads/sources/${encodeURIComponent(id)}`);
}