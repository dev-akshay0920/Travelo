import { Types } from "mongoose";
import { bookingPaymentRepository } from "./booking-payment.repository";
import { invoiceRepository } from "../invoice/invoice.repository";
import { bookingRepository } from "../booking/booking.repository";
import type { CreateBookingPaymentInput, UpdateBookingPaymentInput, BookingPaymentListQuery, BookingPaymentDTO, BookingPaymentListResponse } from "./booking-payment.types";
import { toBookingPaymentDTO } from "./booking-payment.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class BookingPaymentService {
  async create(agencyId: Types.ObjectId, userId: Types.ObjectId, input: CreateBookingPaymentInput): Promise<BookingPaymentDTO> {
    const data = {
      ...input,
      agencyId,
      bookingId: new Types.ObjectId(input.bookingId),
      invoiceId: input.invoiceId ? new Types.ObjectId(input.invoiceId) : undefined,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      recordedBy: userId,
    };

    const payment = await bookingPaymentRepository.create(data);
    await this.syncTotals(agencyId, data.bookingId, data.invoiceId);
    return toBookingPaymentDTO(payment);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<BookingPaymentDTO> {
    const payment = await bookingPaymentRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!payment) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingPaymentDTO(payment);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateBookingPaymentInput): Promise<BookingPaymentDTO> {
    const existing = await bookingPaymentRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!existing) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.bookingId) updateData.bookingId = new Types.ObjectId(input.bookingId);
    if (input.invoiceId) updateData.invoiceId = new Types.ObjectId(input.invoiceId);
    if (input.paidAt) updateData.paidAt = new Date(input.paidAt);

    const payment = await bookingPaymentRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!payment) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    await this.syncTotals(agencyId, payment.bookingId, payment.invoiceId);
    if (existing.bookingId && !existing.bookingId.equals(payment.bookingId)) {
      await this.syncTotals(agencyId, existing.bookingId, existing.invoiceId);
    }
    if (existing.invoiceId && !existing.invoiceId.equals(payment.invoiceId)) {
      await this.syncTotals(agencyId, existing.bookingId, existing.invoiceId);
    }
    return toBookingPaymentDTO(payment);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const existing = await bookingPaymentRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!existing) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    const deleted = await bookingPaymentRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    await this.syncTotals(agencyId, existing.bookingId, existing.invoiceId);
  }

  async list(agencyId: Types.ObjectId, query: BookingPaymentListQuery): Promise<BookingPaymentListResponse> {
    const result = await bookingPaymentRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toBookingPaymentDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByBookingId(bookingId: string, agencyId: Types.ObjectId): Promise<BookingPaymentDTO[]> {
    const payments = await bookingPaymentRepository.getByBookingId(new Types.ObjectId(bookingId), agencyId);
    return payments.map(toBookingPaymentDTO);
  }

  async getTotalPaidForBooking(bookingId: string, agencyId: Types.ObjectId): Promise<number> {
    return bookingPaymentRepository.getTotalPaidForBooking(new Types.ObjectId(bookingId), agencyId);
  }

  private async syncTotals(
    agencyId: Types.ObjectId,
    bookingId?: Types.ObjectId | null,
    invoiceId?: Types.ObjectId | null
  ): Promise<void> {
    if (bookingId) {
      await bookingRepository.recalculatePaidAmount(bookingId, agencyId);
    }
    if (invoiceId) {
      await invoiceRepository.recalculateTotals(invoiceId, agencyId);
    }
  }
}

export const bookingPaymentService = new BookingPaymentService();