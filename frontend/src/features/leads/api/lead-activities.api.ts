import { apiClient } from "@/lib/api";
import type { LeadActivity, LeadActivityListResponse, LeadActivityType } from "@/features/leads/types/lead.types";

export async function getLeadActivitiesApi(
  leadId: string,
  filters: { page: number; limit: number },
): Promise<LeadActivityListResponse> {
  const response = await apiClient.get<{
    success: true;
    data: LeadActivityListResponse;
  }>(`/leads/${encodeURIComponent(leadId)}/activities`, { query: filters });
  return response.data;
}

export async function createLeadActivityApi(input: {
  leadId: string;
  type: LeadActivityType;
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<LeadActivity> {
  const response = await apiClient.post<{ success: true; data: { activity: LeadActivity } }>(
    `/leads/${encodeURIComponent(input.leadId)}/activities`,
    { body: input },
  );
  return response.data.activity;
}