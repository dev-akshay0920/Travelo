export type LeadActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "note"
  | "status_change"
  | "document"
  | "task";

export interface LeadActivityDTO {
  id: string;
  leadId: string;
  staffId?: string;
  staffName?: string;
  type: LeadActivityType;
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityListResponse {
  items: LeadActivityDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}