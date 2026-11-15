import { apiClient } from "@/lib/api";
import type {
  FollowUpReminder,
  FollowUpReminderListResponse,
} from "@/features/leads/types/lead.types";

export async function getFollowUpRemindersApi(filters: {
  page: number;
  limit: number;
  isCompleted?: boolean;
  staffId?: string;
}): Promise<FollowUpReminderListResponse> {
  const response = await apiClient.get<{
    success: true;
    data: FollowUpReminderListResponse;
  }>("/followups", { query: filters });
  return response.data;
}

export async function getDueFollowUpRemindersApi(): Promise<FollowUpReminder[]> {
  const response = await apiClient.get<{
    success: true;
    data: { reminders: FollowUpReminder[] };
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
}): Promise<FollowUpReminder> {
  const response = await apiClient.post<{ success: true; data: { reminder: FollowUpReminder } }>(
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
): Promise<FollowUpReminder> {
  const response = await apiClient.patch<{ success: true; data: { reminder: FollowUpReminder } }>(
    `/followups/${encodeURIComponent(id)}`,
    { body: input },
  );
  return response.data.reminder;
}

export async function deleteFollowUpReminderApi(id: string): Promise<void> {
  await apiClient.delete(`/followups/${encodeURIComponent(id)}`);
}