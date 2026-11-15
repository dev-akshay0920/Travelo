export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "closed",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Converted (agency reported)",
  closed: "Closed",
};

export interface Lead {
  id: string;
  packageId?: string;
  packageName?: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  agencyNote: string;
  pipelineStageId?: string;
  pipelineStage?: {
    id: string;
    name: string;
    color: string;
    order: number;
  } | null;
  leadSourceId?: string;
  leadSource?: {
    id: string;
    name: string;
  } | null;
  assignedStaffId?: string;
  assignedStaff?: {
    id: string;
    name: string;
    email: string;
  } | null;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadDashboard {
  agency: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  packages: {
    total: number;
    activePublic: number;
  };
  leads: {
    total: number;
    byStatus: Record<LeadStatus, number>;
    latest: Array<{
      id: string;
      travelerName: string;
      packageName?: string;
      status: LeadStatus;
      createdAt: string;
    }>;
  };
}

export interface TravelerInquiry {
  id: string;
  agency: {
    id: string;
    name: string;
    slug: string;
  } | null;
  packageId?: string;
  packageName?: string;
  message?: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TravelerInquiryListResponse {
  items: TravelerInquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pipeline stage types
export interface LeadPipeline {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isDefault: boolean;
  isClosedWon: boolean;
  isClosedLost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPipelineListResponse {
  items: LeadPipeline[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lead source types
export interface LeadSource {
  id: string;
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  costPerLead?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSourceListResponse {
  items: LeadSource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Follow-up reminder types
export type FollowUpChannel = "phone" | "email" | "whatsapp" | "meeting";

export interface FollowUpReminder {
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
  items: FollowUpReminder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lead activity types
export type LeadActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "note"
  | "status_change"
  | "document"
  | "task";

export interface LeadActivity {
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
  items: LeadActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
