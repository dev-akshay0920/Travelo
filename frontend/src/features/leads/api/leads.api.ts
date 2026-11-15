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
  travelerPhone?: string;
  requestedStartDate?: string;
  travelerCount?: number;
}

export async function createLeadApi(input: CreateLeadInput): Promise<void> {
  await apiClient.post<{ success: true; data: { lead: { id: string; status: LeadStatus; createdAt: string } } }>("/leads", {
    body: { ...input, travelerPhone: input.travelerPhone },
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

// Pipeline stages API
export async function getLeadPipelinesApi(filters: {
  page: number;
  limit: number;
}): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get<{
    success: true;
    data: { items: any[]; total: number; page: number; limit: number; totalPages: number };
  }>("/leads/pipeline", { query: filters });
  return response.data;
}

export async function createLeadPipelineApi(input: {
  name: string;
  order?: number;
  probability?: number;
  color?: string;
  isDefault?: boolean;
  isClosedWon?: boolean;
  isClosedLost?: boolean;
}): Promise<any> {
  const response = await apiClient.post<{ success: true; data: { pipeline: any } }>(
    "/leads/pipeline",
    { body: input },
  );
  return response.data.pipeline;
}

export async function updateLeadPipelineApi(
  id: string,
  input: Partial<{
    name: string;
    order: number;
    probability: number;
    color: string;
    isDefault: boolean;
    isClosedWon: boolean;
    isClosedLost: boolean;
  }>,
): Promise<any> {
  const response = await apiClient.patch<{ success: true; data: { pipeline: any } }>(
    `/leads/pipeline/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.pipeline;
}

export async function deleteLeadPipelineApi(id: string): Promise<void> {
  await apiClient.delete(`/leads/pipeline/${encodeURIComponent(id)}`);
}

// Lead sources API
export async function getLeadSourcesApi(filters: {
  page: number;
  limit: number;
  isActive?: boolean;
}): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get<{
    success: true;
    data: { items: any[]; total: number; page: number; limit: number; totalPages: number };
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
}): Promise<any> {
  const response = await apiClient.post<{ success: true; data: { source: any } }>(
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
): Promise<any> {
  const response = await apiClient.patch<{ success: true; data: { source: any } }>(
    `/leads/sources/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.source;
}

export async function deleteLeadSourceApi(id: string): Promise<void> {
  await apiClient.delete(`/leads/sources/${encodeURIComponent(id)}`);
}

// Follow-up reminders API
export async function getFollowUpRemindersApi(filters: {
  page: number;
  limit: number;
  isCompleted?: boolean;
  staffId?: string;
}): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get<{
    success: true;
    data: { items: any[]; total: number; page: number; limit: number; totalPages: number };
  }>("/followups", { query: filters });
  return response.data;
}

export async function getDueFollowUpRemindersApi(): Promise<any[]> {
  const response = await apiClient.get<{
    success: true;
    data: { reminders: any[] };
  }>("/followups/due");
  return response.data.reminders;
}

export async function createFollowUpReminderApi(input: {
  leadId: string;
  staffId?: string;
  reminderAt: string;
  title: string;
  notes?: string;
  channel: "phone" | "email" | "whatsapp" | "meeting";
}): Promise<any> {
  const response = await apiClient.post<{ success: true; data: { reminder: any } }>(
    "/followups",
    { body: input },
  );
  return response.data.reminder;
}

export async function updateFollowUpReminderApi(
  id: string,
  input: Partial<{
    reminderAt: string;
    title: string;
    notes: string;
    isCompleted: boolean;
    channel: "phone" | "email" | "whatsapp" | "meeting";
  }>,
): Promise<any> {
  const response = await apiClient.patch<{ success: true; data: { reminder: any } }>(
    `/followups/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.reminder;
}

export async function deleteFollowUpReminderApi(id: string): Promise<void> {
  await apiClient.delete(`/followups/${encodeURIComponent(id)}`);
}

// Lead activities API
export async function getLeadActivitiesApi(
  leadId: string,
  filters: { page: number; limit: number },
): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get<{
    success: true;
    data: { items: any[]; total: number; page: number; limit: number; totalPages: number };
  }>(`/leads/${encodeURIComponent(leadId)}/activities`, { query: filters });
  return response.data;
}

export async function createLeadActivityApi(input: {
  leadId: string;
  type: "call" | "email" | "whatsapp" | "note" | "status_change" | "document" | "task";
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<any> {
  const response = await apiClient.post<{ success: true; data: { activity: any } }>(
    `/leads/${encodeURIComponent(input.leadId)}/activities`,
    { body: input },
  );
  return response.data.activity;
}
