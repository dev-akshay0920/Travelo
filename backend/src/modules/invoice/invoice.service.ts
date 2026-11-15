import { Types } from "mongoose";
import { invoiceRepository } from "./invoice.repository";
import type { CreateInvoiceInput, UpdateInvoiceInput, InvoiceListQuery, InvoiceDTO, InvoiceListResponse } from "./invoice.types";
import { toInvoiceDTO } from "./invoice.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class InvoiceService {
  async create(agencyId: Types.ObjectId, input: CreateInvoiceInput): Promise<InvoiceDTO> {
    const data = {
      ...input,
      agencyId,
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    };

    const invoice = await invoiceRepository.create(data);
    return toInvoiceDTO(invoice);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<InvoiceDTO> {
    const invoice = await invoiceRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toInvoiceDTO(invoice);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateInvoiceInput): Promise<InvoiceDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.bookingId) updateData.bookingId = new Types.ObjectId(input.bookingId);
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);
    if (input.paymentLinkExpiresAt) updateData.paymentLinkExpiresAt = new Date(input.paymentLinkExpiresAt);

    const invoice = await invoiceRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toInvoiceDTO(invoice);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await invoiceRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: InvoiceListQuery): Promise<InvoiceListResponse> {
    const result = await invoiceRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toInvoiceDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByBookingId(bookingId: string, agencyId: Types.ObjectId): Promise<InvoiceDTO[]> {
    const invoices = await invoiceRepository.getByBookingId(new Types.ObjectId(bookingId), agencyId);
    return invoices.map(toInvoiceDTO);
  }

  async getByLeadId(leadId: string, agencyId: Types.ObjectId): Promise<InvoiceDTO[]> {
    const invoices = await invoiceRepository.getByLeadId(new Types.ObjectId(leadId), agencyId);
    return invoices.map(toInvoiceDTO);
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return invoiceRepository.countByStatus(agencyId);
  }

  async getOverdueInvoices(agencyId: Types.ObjectId): Promise<InvoiceDTO[]> {
    const invoices = await invoiceRepository.getOverdueInvoices(agencyId);
    return invoices.map(toInvoiceDTO);
  }

  async updateStatus(id: string, agencyId: Types.ObjectId, status: string): Promise<InvoiceDTO> {
    const invoice = await invoiceRepository.updateStatus(new Types.ObjectId(id), agencyId, status);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toInvoiceDTO(invoice);
  }

  async recordPayment(id: string, agencyId: Types.ObjectId, amount: number): Promise<InvoiceDTO> {
    const invoice = await invoiceRepository.recordPayment(new Types.ObjectId(id), agencyId, amount);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toInvoiceDTO(invoice);
  }
}

export const invoiceService = new InvoiceService();