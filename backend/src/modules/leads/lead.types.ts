export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "closed" | "archived";

export interface Lead {
  id: string;
  agencyId: string;
  travellerId: string;
  packageId?: string;
  travellerName: string;
  travellerEmail: string;
  travellerPhone?: string;
  message: string;
  requestedStartDate?: string;
  requestedEndDate?: string;
  numberOfTravelers: number;
  budget?: number;
  specialRequests?: string;
  status: LeadStatus;
  agencyNote?: string;
  source: "website" | "package_page" | "agency_page";
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

export interface CreateLeadInput {
  agencyId: string;
  packageId?: string;
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
  travellerName?: string;
  travellerEmail?: string;
  travellerPhone?: string;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  agencyNote?: string;
}

export interface LeadListFilters {
  status?: LeadStatus;
  packageId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface LeadDashboardInput {
  agencyId: string;
}