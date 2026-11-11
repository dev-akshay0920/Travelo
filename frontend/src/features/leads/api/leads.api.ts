import { apiClient } from "@/lib/api";
import type {
  Lead,
  LeadDashboard,
  LeadListResponse,
  LeadStatus,
  TravelerInquiry,
  TravelerInquiryListResponse,
} from "@/features/leads/types/lead.types";

export interface CreateLeadInput {
  agencyId: string;
  packageId?: string;
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
}

export async function createLeadApi(input: CreateLeadInput): Promise<void> {
  await apiClient.post<{ success: true; data: { lead: { id: string; status: LeadStatus; createdAt: string } } }>("/leads", {
    body: input,
  });
}

export async function getAgencyDashboardApi(): Promise<LeadDashboard> {
  const response = await apiClient.get<{
    success: true;
    data: { dashboard: LeadDashboard };
  }>("/leads/dashboard");
  return response.data.dashboard;
}

export async function getAgencyLeadsApi(filters: {
  page: number;
  limit: number;
  status?: LeadStatus;
  packageId?: string;
}): Promise<LeadListResponse> {
  const response = await apiClient.get<{
    success: true;
    data: LeadListResponse;
  }>("/leads", { query: filters });
  return response.data;
}

export async function updateLeadApi(
  id: string,
  input: { status?: LeadStatus; agencyNote?: string },
): Promise<Lead> {
  const response = await apiClient.patch<{ success: true; data: { lead: Lead } }>(
    `/leads/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.lead;
}

export async function getMyInquiriesApi(filters: {
  page: number;
  limit: number;
}): Promise<TravelerInquiryListResponse> {
  const response = await apiClient.get<{
    success: true;
    data: TravelerInquiryListResponse;
  }>("/leads/mine", { query: filters });
  return response.data;
}

export async function getMyInquiryApi(id: string): Promise<TravelerInquiry> {
  const response = await apiClient.get<{
    success: true;
    data: { lead: TravelerInquiry };
  }>(`/leads/mine/${encodeURIComponent(id)}`);
  return response.data.lead;
}
