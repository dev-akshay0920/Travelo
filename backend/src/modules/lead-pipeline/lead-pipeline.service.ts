import { Types } from "mongoose";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import { UserRepository } from "../users/user.repository";
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

async function getActiveUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new UnauthorizedError();
  const user = await UserRepository.findByIdWithRole(userId);
  if (!user || user.status !== "active") throw new UnauthorizedError();
  return user;
}

async function requireAgencyOwner(userId: string) {
  const user = await getActiveUser(userId);
  if (user.roleId?.key !== "agency") {
    throw new ForbiddenError("Agency owner access is required.");
  }
  const agency = await AgencyRepository.findByOwnerUserId(userId);
  if (!agency) throw new NotFoundError("Agency profile not found.");
  return agency;
}

export const LeadPipelineService = {
  async create(
    userId: string,
    input: CreateLeadPipelineInput
  ): Promise<LeadPipelineDTO> {
    const agency = await requireAgencyOwner(userId);
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
    const agency = await requireAgencyOwner(userId);
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
    const agency = await requireAgencyOwner(userId);
    const pipeline = await LeadPipelineRepository.findByIdAndAgency(id, String(agency._id));
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
    return toLeadPipelineDTO(pipeline);
  },

  async update(
    userId: string,
    id: string,
    input: UpdateLeadPipelineInput
  ): Promise<LeadPipelineDTO> {
    const agency = await requireAgencyOwner(userId);
    const pipeline = await LeadPipelineRepository.updateByIdAndAgency(
      id,
      String(agency._id),
      input
    );
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
    return toLeadPipelineDTO(pipeline);
  },

  async delete(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyOwner(userId);
    const pipeline = await LeadPipelineRepository.deleteByIdAndAgency(id, String(agency._id));
    if (!pipeline) throw new NotFoundError("Pipeline stage not found.");
  },
};