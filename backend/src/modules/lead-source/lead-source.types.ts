export interface LeadSourceDTO {
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
  items: LeadSourceDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}