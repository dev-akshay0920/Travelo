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
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  agencyNote: string;
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
