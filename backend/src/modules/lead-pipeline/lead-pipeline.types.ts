export interface LeadPipelineDTO {
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
  items: LeadPipelineDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}