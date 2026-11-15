import { Types } from "mongoose";
import { documentRepository } from "./document.repository";
import type { CreateDocumentInput, UpdateDocumentInput, DocumentListQuery, DocumentDTO, DocumentListResponse } from "./document.types";
import { toDocumentDTO } from "./document.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class DocumentService {
  async create(agencyId: Types.ObjectId, userId: Types.ObjectId, input: CreateDocumentInput): Promise<DocumentDTO> {
    const data = {
      ...input,
      agencyId,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      invoiceId: input.invoiceId ? new Types.ObjectId(input.invoiceId) : undefined,
      uploadedBy: userId,
    };

    const document = await documentRepository.create(data);
    return toDocumentDTO(document);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<DocumentDTO> {
    const document = await documentRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!document) {
      throw new AppError("Document not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toDocumentDTO(document);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateDocumentInput): Promise<DocumentDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.bookingId) updateData.bookingId = new Types.ObjectId(input.bookingId);
    if (input.invoiceId) updateData.invoiceId = new Types.ObjectId(input.invoiceId);

    const document = await documentRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!document) {
      throw new AppError("Document not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toDocumentDTO(document);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await documentRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Document not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: DocumentListQuery): Promise<DocumentListResponse> {
    const result = await documentRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toDocumentDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByLeadId(leadId: string, agencyId: Types.ObjectId): Promise<DocumentDTO[]> {
    const documents = await documentRepository.getByLeadId(new Types.ObjectId(leadId), agencyId);
    return documents.map(toDocumentDTO);
  }

  async getByBookingId(bookingId: string, agencyId: Types.ObjectId): Promise<DocumentDTO[]> {
    const documents = await documentRepository.getByBookingId(new Types.ObjectId(bookingId), agencyId);
    return documents.map(toDocumentDTO);
  }

  async getByInvoiceId(invoiceId: string, agencyId: Types.ObjectId): Promise<DocumentDTO[]> {
    const documents = await documentRepository.getByInvoiceId(new Types.ObjectId(invoiceId), agencyId);
    return documents.map(toDocumentDTO);
  }
}

export const documentService = new DocumentService();