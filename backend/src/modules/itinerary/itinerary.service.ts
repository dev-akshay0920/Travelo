import { Types } from "mongoose";
import { itineraryRepository } from "./itinerary.repository";
import type { CreateItineraryInput, UpdateItineraryInput, ItineraryListQuery, ItineraryDTO, ItineraryListResponse } from "./itinerary.types";
import { toItineraryDTO } from "./itinerary.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class ItineraryService {
  async create(agencyId: Types.ObjectId, input: CreateItineraryInput): Promise<ItineraryDTO> {
    const data = {
      ...input,
      agencyId,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      packageId: input.packageId ? new Types.ObjectId(input.packageId) : undefined,
    };

    const itinerary = await itineraryRepository.create(data);
    return toItineraryDTO(itinerary);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<ItineraryDTO> {
    const itinerary = await itineraryRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!itinerary) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(itinerary);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateItineraryInput): Promise<ItineraryDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.packageId) updateData.packageId = new Types.ObjectId(input.packageId);

    const itinerary = await itineraryRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!itinerary) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(itinerary);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await itineraryRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: ItineraryListQuery): Promise<ItineraryListResponse> {
    const result = await itineraryRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toItineraryDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getTemplates(agencyId: Types.ObjectId): Promise<ItineraryDTO[]> {
    const templates = await itineraryRepository.getTemplatesByAgency(agencyId);
    return templates.map(toItineraryDTO);
  }

  async duplicate(id: string, agencyId: Types.ObjectId, newName: string): Promise<ItineraryDTO> {
    const duplicated = await itineraryRepository.duplicateItinerary(new Types.ObjectId(id), agencyId, newName);
    if (!duplicated) {
      throw new AppError("Itinerary not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toItineraryDTO(duplicated);
  }
}

export const itineraryService = new ItineraryService();