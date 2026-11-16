import { Types } from "mongoose";
import { quotationRepository } from "./quotation.repository";
import { bookingRepository } from "../booking/booking.repository";
import { taskRepository } from "../task/task.repository";
import { Lead } from "../leads/lead.model";
import { Agency } from "../agencies/agency.model";
import type { CreateQuotationInput, UpdateQuotationInput, QuotationListQuery, QuotationDTO, QuotationListResponse } from "./quotation.types";
import type { QuotationDocument } from "./quotation.model";
import type { BookingDocument } from "../booking/booking.model";
import { toQuotationDTO } from "./quotation.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export interface PublicAcceptResult {
  quotation: QuotationDTO;
  bookingId?: string;
  bookingNumber?: string;
}

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

  async acceptQuotationPublic(token: string): Promise<PublicAcceptResult> {
    const quotation = await quotationRepository.findByPublicLink(token);
    if (!quotation) {
      throw new AppError("Quotation not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (quotation.shareLinkExpiresAt && quotation.shareLinkExpiresAt < new Date()) {
      throw new AppError("Quotation link has expired", HTTP_STATUS.GONE, ERROR_CODES.NOT_FOUND);
    }

    if (quotation.status === "accepted" || quotation.status === "converted") {
      return {
        quotation: toQuotationDTO(quotation),
        bookingId: quotation.convertedBookingId?.toString(),
      };
    }

    const accepted = await quotationRepository.markAsAccepted(quotation._id, quotation.agencyId);
    if (!accepted) {
      throw new AppError("Quotation cannot be accepted", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    const booking = await this.createDraftBooking(accepted);
    const converted = await quotationRepository.updateByIdAndAgency(
      accepted._id,
      accepted.agencyId,
      { status: "converted", convertedBookingId: booking._id }
    );

    return {
      quotation: toQuotationDTO(converted ?? accepted),
      bookingId: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
    };
  }

  private async createDraftBooking(quotation: QuotationDocument): Promise<BookingDocument> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const lead = await Lead.findOne({ _id: quotation.leadId, agencyId: quotation.agencyId }).exec();

    const travellerName = lead?.travelerName ?? "Traveller";
    const travellerEmail = lead?.travelerEmail;
    const travellerPhone = lead?.travelerPhone;
    const travellerCount = Math.min(Math.max(lead?.travelerCount ?? 1, 1), 20);

    const startDate = lead?.requestedStartDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const booking = await bookingRepository.create({
      agencyId: quotation.agencyId,
      leadId: quotation.leadId,
      quotationId: quotation._id,
      itineraryId: quotation.itineraryId,
      travellerId: lead?.travelerId,
      travellers: Array.from({ length: travellerCount }, () => ({
        name: travellerName,
        email: travellerEmail,
        phone: travellerPhone,
      })),
      startDate,
      endDate,
      departureDate: startDate,
      status: "enquiry",
      totalPrice: quotation.total,
      currency: quotation.currency,
    });

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const agency = await Agency.findById(quotation.agencyId).exec();
    const ownerUserId = agency?.ownerUserId;
    if (ownerUserId) {
      await taskRepository.create({
        agencyId: quotation.agencyId,
        title: `Quotation ${quotation.quotationNumber} accepted - confirm booking`,
        description: `A traveller accepted quotation ${quotation.quotationNumber}. A draft booking ${booking.bookingNumber} was created for review.`,
        type: "booking",
        status: "pending",
        priority: "high",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        assignedTo: ownerUserId,
        createdBy: ownerUserId,
        leadId: quotation.leadId,
        bookingId: booking._id,
      });
    }

    return booking;
  }
}

export const quotationService = new QuotationService();