export type FollowUpChannel = "phone" | "email" | "whatsapp" | "meeting";

export interface FollowUpReminderDTO {
  id: string;
  leadId: string;
  staffId: string;
  staffName?: string;
  reminderAt: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  channel: FollowUpChannel;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpReminderListResponse {
  items: FollowUpReminderDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}