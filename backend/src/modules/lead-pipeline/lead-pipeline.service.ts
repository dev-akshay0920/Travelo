import {
  NotFoundError,
} from "../../shared/errors/app-error";
import { requireAgencyMemberDocument } from "../staff/agency-membership.service";
import type { LeadPipelineDocument } from "./lead-pipeline.model";
import { LeadPipelineRepository } from "./lead-pipeline.repository";
import type {
  CreateLeadPipelineInput,
  ListLeadPipelinesQuery,
  UpdateLeadPipelineInput,
} from "./lead-pipeline.validation";

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

function toLeadPipelineDTO(pipeline: LeadPipelineDocument): LeadPipelineDTO {
  return {
    id: String(pipeline._id),
    name: pipeline.name,
    order: pipeline.order,
    probability: pipeline.probability,
    color: pipeline.color,
    isDefault: pipeline.isDefault,
    isClosedWon: pipeline.isClosedWon,
    isClosedLost: pipeline.isClosedLost,
    createdAt: pipeline.createdAt.toISOString(),
    updatedAt: pipeline.updatedAt.toISOString(),
  };
}

export const LeadPipelineService = {
  async create(
    userId: string,
    input: CreateLeadPipelineInput
  ): Promise<LeadPipelineDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const pipeline = await LeadPipelineRepository.create({
      agencyId: agency._id,
      name: input.name,
      order: input.order,
      probability: input.probability,
      color: input.color,
      isDefault: input.isDefault,
      isClosedWon: input.isClosedWon,
      isClosedLost: input.isClosedLost,
    });
    return toLeadPipelineDTO(pipeline);
  },

  async list(
    userId: string,
    filters: ListLeadPipelinesQuery
  ): Promise<{ items: LeadPipelineDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const agency = await requireAgencyMemberDocument(userId);
    const { items, total } = await LeadPipelineRepository.listByAgency(
      String(agency._id),
      filters
    );
    return {
      items: items.map(toLeadPipelineDTO),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async getById(userId: string, id: string): Promise<LeadPipelineDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const pipeline = await LeadPipelineRepository.findByIdAndAgency(id, String(agency._id));
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
    return toLeadPipelineDTO(pipeline);
  },

  async update(
    userId: string,
    id: string,
    input: UpdateLeadPipelineInput
  ): Promise<LeadPipelineDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const pipeline = await LeadPipelineRepository.updateByIdAndAgency(
      id,
      String(agency._id),
      input
    );
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
    return toLeadPipelineDTO(pipeline);
  },

  async delete(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyMemberDocument(userId);
    const pipeline = await LeadPipelineRepository.deleteByIdAndAgency(id, String(agency._id));
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
  },
};