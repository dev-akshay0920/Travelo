import { Types } from "mongoose";
import { invoiceRepository } from "./invoice.repository";
import { bookingPaymentRepository } from "../booking-payment/booking-payment.repository";
import { bookingRepository } from "../booking/booking.repository";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceListQuery,
  InvoiceDTO,
  InvoiceListResponse,
  RecordInvoicePaymentInput,
} from "./invoice.types";
import type { InvoiceDocument } from "./invoice.model";
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
    const invoiceId = new Types.ObjectId(id);
    const invoice = await invoiceRepository.findByIdAndAgency(invoiceId, agencyId);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return this.toInvoiceWithPayments(invoice, agencyId);
  }

  private async toInvoiceWithPayments(
    invoice: InvoiceDocument,
    agencyId: Types.ObjectId
  ): Promise<InvoiceDTO> {
    const dto = toInvoiceDTO(invoice);
    const ledgerPayments = await invoiceRepository.listLedgerPayments(invoice._id, agencyId);
    if (ledgerPayments.length === 0) {
      return dto;
    }
    const embeddedPayments = dto.payments ?? [];
    const merged = [
      ...ledgerPayments.map((payment) => ({
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        notes: payment.notes,
        paidAt: new Date(payment.paidAt).toISOString(),
        recordedBy: payment.recordedBy?.toString(),
      })),
      ...embeddedPayments,
    ].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    return { ...dto, payments: merged };
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
    const recalculated = await invoiceRepository.recalculateTotals(new Types.ObjectId(id), agencyId);
    return toInvoiceDTO(recalculated ?? invoice);
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

  async recordPayment(
    id: string,
    agencyId: Types.ObjectId,
    input: RecordInvoicePaymentInput,
    userId?: Types.ObjectId
  ): Promise<InvoiceDTO> {
    const invoiceId = new Types.ObjectId(id);
    const invoice = await invoiceRepository.findByIdAndAgency(invoiceId, agencyId);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    if (invoice.status === "cancelled") {
      throw new AppError(
        "Payments cannot be recorded against a cancelled invoice",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT
      );
    }
    if (!input.amount || input.amount <= 0) {
      throw new AppError(
        "Payment amount must be greater than 0",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    if (invoice.bookingId) {
      await bookingPaymentRepository.create({
        agencyId,
        bookingId: invoice.bookingId,
        invoiceId,
        amount: input.amount,
        currency: invoice.currency,
        method: input.method,
        transactionId: input.transactionId,
        paidAt,
        notes: input.notes,
        recordedBy: userId ?? new Types.ObjectId(),
      });
    } else {
      await invoiceRepository.addEmbeddedPayment(invoiceId, agencyId, {
        amount: input.amount,
        method: input.method,
        transactionId: input.transactionId,
        notes: input.notes,
        paidAt,
        recordedBy: userId,
      });
    }

    const updatedInvoice = await invoiceRepository.recalculateTotals(invoiceId, agencyId);
    if (!updatedInvoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (updatedInvoice.bookingId) {
      await bookingRepository.recalculatePaidAmount(updatedInvoice.bookingId, agencyId);
    }

    return toInvoiceDTO(updatedInvoice);
  }
}

export const invoiceService = new InvoiceService();