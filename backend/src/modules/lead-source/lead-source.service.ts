import {
  NotFoundError,
} from "../../shared/errors/app-error";
import { requireAgencyMemberDocument } from "../staff/agency-membership.service";
import type { LeadSourceDocument } from "./lead-source.model";
import { LeadSourceRepository } from "./lead-source.repository";
import type {
  CreateLeadSourceInput,
  ListLeadSourcesQuery,
  UpdateLeadSourceInput,
} from "./lead-source.validation";

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

function toLeadSourceDTO(source: LeadSourceDocument): LeadSourceDTO {
  return {
    id: String(source._id),
    name: source.name,
    ...(source.utmSource ? { utmSource: source.utmSource } : {}),
    ...(source.utmMedium ? { utmMedium: source.utmMedium } : {}),
    ...(source.utmCampaign ? { utmCampaign: source.utmCampaign } : {}),
    ...(source.costPerLead !== undefined ? { costPerLead: source.costPerLead } : {}),
    isActive: source.isActive,
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString(),
  };
}

export const LeadSourceService = {
  async create(
    userId: string,
    input: CreateLeadSourceInput
  ): Promise<LeadSourceDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const source = await LeadSourceRepository.create({
      agencyId: agency._id,
      name: input.name,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      costPerLead: input.costPerLead,
      isActive: input.isActive,
    });
    return toLeadSourceDTO(source);
  },

  async list(
    userId: string,
    filters: ListLeadSourcesQuery
  ): Promise<{ items: LeadSourceDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const agency = await requireAgencyMemberDocument(userId);
    const { items, total } = await LeadSourceRepository.listByAgency(
      String(agency._id),
      filters
    );
    return {
      items: items.map(toLeadSourceDTO),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async getById(userId: string, id: string): Promise<LeadSourceDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const source = await LeadSourceRepository.findByIdAndAgency(id, String(agency._id));
    if (!source) throw new NotFoundError("Lead source not found.");
    return toLeadSourceDTO(source);
  },

  async update(
    userId: string,
    id: string,
    input: UpdateLeadSourceInput
  ): Promise<LeadSourceDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const source = await LeadSourceRepository.updateByIdAndAgency(id, String(agency._id), input);
    if (!source) throw new NotFoundError("Lead source not found.");
    return toLeadSourceDTO(source);
  },

  async delete(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyMemberDocument(userId);
    const source = await LeadSourceRepository.deleteByIdAndAgency(id, String(agency._id));
    if (!source) throw new NotFoundError("Lead source not found.");
  },
};