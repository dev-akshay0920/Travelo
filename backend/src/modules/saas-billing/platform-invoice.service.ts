import { Types } from "mongoose";
import { platformInvoiceRepository } from "./platform-invoice.repository";
import type { CreatePlatformInvoiceInput, UpdatePlatformInvoiceInput, PlatformInvoiceListQuery, PlatformInvoiceDTO, PlatformInvoiceListResponse } from "./platform-invoice.types";
import { toPlatformInvoiceDTO } from "./platform-invoice.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class PlatformInvoiceService {
  async create(input: CreatePlatformInvoiceInput): Promise<PlatformInvoiceDTO> {
    const data = {
      ...input,
      agencyId: new Types.ObjectId(input.agencyId),
      subscriptionId: new Types.ObjectId(input.subscriptionId),
      taxAmount: input.taxAmount || 0,
      currency: input.currency || "INR",
      taxPercentage: input.taxPercentage || 0,
      dueDate: new Date(input.dueDate),
      billingPeriodStart: new Date(input.billingPeriodStart),
      billingPeriodEnd: new Date(input.billingPeriodEnd),
    };

    const invoice = await platformInvoiceRepository.create(data);
    return toPlatformInvoiceDTO(invoice);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<PlatformInvoiceDTO> {
    const invoice = await platformInvoiceRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toPlatformInvoiceDTO(invoice);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdatePlatformInvoiceInput): Promise<PlatformInvoiceDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.paidAt) updateData.paidAt = new Date(input.paidAt);

    const invoice = await platformInvoiceRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toPlatformInvoiceDTO(invoice);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await platformInvoiceRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: PlatformInvoiceListQuery): Promise<PlatformInvoiceListResponse> {
    const result = await platformInvoiceRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toPlatformInvoiceDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async listAll(query: PlatformInvoiceListQuery): Promise<PlatformInvoiceListResponse> {
    const result = await platformInvoiceRepository.listAll(query);
    return {
      items: result.items.map(toPlatformInvoiceDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getOverdueInvoices(): Promise<PlatformInvoiceDTO[]> {
    const invoices = await platformInvoiceRepository.getOverdueInvoices();
    return invoices.map(toPlatformInvoiceDTO);
  }

  async getBySubscriptionId(subscriptionId: string): Promise<PlatformInvoiceDTO[]> {
    const invoices = await platformInvoiceRepository.getBySubscriptionId(new Types.ObjectId(subscriptionId));
    return invoices.map(toPlatformInvoiceDTO);
  }

  async recordPayment(
    agencyId: Types.ObjectId,
    id: string,
    paymentMethod: string,
    reference?: string,
    paidAt?: string | Date
  ): Promise<PlatformInvoiceDTO> {
    const invoice = await platformInvoiceRepository.updateByIdAndAgency(
      new Types.ObjectId(id),
      agencyId,
      {
        status: "paid",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        paymentMethod: paymentMethod as any,
        paymentReference: reference,
      }
    );
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toPlatformInvoiceDTO(invoice);
  }
}

export const platformInvoiceService = new PlatformInvoiceService();