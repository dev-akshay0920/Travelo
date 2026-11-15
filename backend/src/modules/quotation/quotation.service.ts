import { Types } from "mongoose";
import { quotationRepository } from "./quotation.repository";
import type { CreateQuotationInput, UpdateQuotationInput, QuotationListQuery, QuotationDTO, QuotationListResponse } from "./quotation.types";
import { toQuotationDTO } from "./quotation.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class QuotationService {
  private generateQuotationNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QT-${timestamp}-${random}`;
  }

  private generateShareLink(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  async create(agencyId: Types.ObjectId, input: CreateQuotationInput): Promise<QuotationDTO> {
    const data = {
      ...input,
      agencyId,
      leadId: new Types.ObjectId(input.leadId),
      itineraryId: input.itineraryId ? new Types.ObjectId(input.itineraryId) : undefined,
      validUntil: new Date(input.validUntil),
      quotationNumber: this.generateQuotationNumber(),
      publicShareLink: this.generateShareLink(),
      shareLinkExpiresAt: input.validUntil ? new Date(new Date(input.validUntil).getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
    };

    const quotation = await quotationRepository.create(data);
    return toQuotationDTO(quotation);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<QuotationDTO> {
    const quotation = await quotationRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toQuotationDTO(quotation);
  }

  async getByPublicLink(token: string): Promise<QuotationDTO> {
    const quotation = await quotationRepository.findByPublicLink(token);
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (quotation.shareLinkExpiresAt && quotation.shareLinkExpiresAt < new Date()) {
      throw new AppError("Quotation link has expired", HTTP_STATUS.GONE, ERROR_CODES.NOT_FOUND);
    }

    if (quotation.status === "sent") {
      await quotationRepository.markAsViewed(quotation._id, quotation.agencyId);
      quotation.status = "viewed";
      quotation.viewedAt = new Date();
    }

    return toQuotationDTO(quotation);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateQuotationInput): Promise<QuotationDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.itineraryId) updateData.itineraryId = new Types.ObjectId(input.itineraryId);
    if (input.validUntil) updateData.validUntil = new Date(input.validUntil);
    if (input.shareLinkExpiresAt) updateData.shareLinkExpiresAt = new Date(input.shareLinkExpiresAt);

    const quotation = await quotationRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toQuotationDTO(quotation);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await quotationRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: QuotationListQuery): Promise<QuotationListResponse> {
    const result = await quotationRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toQuotationDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByLeadId(leadId: string, agencyId: Types.ObjectId): Promise<QuotationDTO[]> {
    const quotations = await quotationRepository.getByLeadId(new Types.ObjectId(leadId), agencyId);
    return quotations.map(toQuotationDTO);
  }

  async getStatusCounts(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return quotationRepository.countByStatus(agencyId);
  }

  async sendQuotation(id: string, agencyId: Types.ObjectId): Promise<QuotationDTO> {
    const quotation = await quotationRepository.updateByIdAndAgency(
      new Types.ObjectId(id),
      agencyId,
      { status: "sent" }
    );
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toQuotationDTO(quotation);
  }

  async acceptQuotation(id: string, agencyId: Types.ObjectId): Promise<QuotationDTO> {
    const quotation = await quotationRepository.markAsAccepted(new Types.ObjectId(id), agencyId);
    if (!quotation) {
      throw new AppError("Quotation not found or cannot be accepted", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toQuotationDTO(quotation);
  }

  async acceptQuotationPublic(token: string): Promise<QuotationDTO> {
    const quotation = await quotationRepository.findByPublicLink(token);
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (quotation.shareLinkExpiresAt && quotation.shareLinkExpiresAt < new Date()) {
      throw new AppError("Quotation link has expired", HTTP_STATUS.GONE, ERROR_CODES.NOT_FOUND);
    }

    const updated = await quotationRepository.markAsAccepted(quotation._id, quotation.agencyId);
    if (!updated) {
      throw new AppError("Quotation cannot be accepted", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }
    return toQuotationDTO(updated);
  }
}

export const quotationService = new QuotationService();