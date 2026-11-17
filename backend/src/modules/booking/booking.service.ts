import { Types } from "mongoose";
import { env } from "../../config/env";
import { bookingRepository } from "./booking.repository";
import type { CreateBookingInput, UpdateBookingInput, BookingListQuery, BookingDTO, BookingListResponse, SupplierBookingDTO } from "./booking.types";
import type { SupplierBooking } from "./booking.model";
import { toBookingDTO } from "./booking.types";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class BookingService {
  async create(agencyId: Types.ObjectId, input: CreateBookingInput): Promise<BookingDTO> {
    const data = {
      ...input,
      agencyId,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      quotationId: input.quotationId ? new Types.ObjectId(input.quotationId) : undefined,
      travellerId: input.travellerId ? new Types.ObjectId(input.travellerId) : undefined,
      packageId: input.packageId ? new Types.ObjectId(input.packageId) : undefined,
      itineraryId: input.itineraryId ? new Types.ObjectId(input.itineraryId) : undefined,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      departureDate: new Date(input.departureDate),
      staffId: input.staffId ? new Types.ObjectId(input.staffId) : undefined,
      supplierBookings: input.supplierBookings?.map((sb) => ({
        ...sb,
        supplierId: new Types.ObjectId(sb.supplierId),
      })),
    };

    const booking = await bookingRepository.create(data);
    return toBookingDTO(booking);
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<BookingDTO> {
    const booking = await bookingRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateBookingInput): Promise<BookingDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.leadId) updateData.leadId = new Types.ObjectId(input.leadId);
    if (input.quotationId) updateData.quotationId = new Types.ObjectId(input.quotationId);
    if (input.travellerId) updateData.travellerId = new Types.ObjectId(input.travellerId);
    if (input.packageId) updateData.packageId = new Types.ObjectId(input.packageId);
    if (input.itineraryId) updateData.itineraryId = new Types.ObjectId(input.itineraryId);
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);
    if (input.departureDate) updateData.departureDate = new Date(input.departureDate);
    if (input.staffId) updateData.staffId = new Types.ObjectId(input.staffId);
    if (input.supplierBookings) {
      updateData.supplierBookings = input.supplierBookings.map((sb) => ({
        ...sb,
        supplierId: new Types.ObjectId(sb.supplierId),
      }));
    }

    const booking = await bookingRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, updateData);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await bookingRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }
async list(agencyId: Types.ObjectId, query: BookingListQuery): Promise<BookingListResponse> {
    const result = await bookingRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map(toBookingDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByLeadId(leadId: string, agencyId: Types.ObjectId): Promise<BookingDTO[]> {
    const bookings = await bookingRepository.getByLeadId(new Types.ObjectId(leadId), agencyId);
    return bookings.map(toBookingDTO);
  }

  async getByQuotationId(quotationId: string, agencyId: Types.ObjectId): Promise<BookingDTO[]> {
    const bookings = await bookingRepository.getByQuotationId(new Types.ObjectId(quotationId), agencyId);
    return bookings.map(toBookingDTO);
  }

  async getByStatus(agencyId: Types.ObjectId, status: string): Promise<BookingDTO[]> {
    const bookings = await bookingRepository.getByStatus(agencyId, status);
    return bookings.map(toBookingDTO);
  }

  async getUpcomingDepartures(agencyId: Types.ObjectId, days: number = 30): Promise<BookingDTO[]> {
    const bookings = await bookingRepository.getUpcomingDepartures(agencyId, days);
    return bookings.map(toBookingDTO);
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return bookingRepository.countByStatus(agencyId);
  }

  async updateStatus(id: string, agencyId: Types.ObjectId, status: string): Promise<BookingDTO> {
    const booking = await bookingRepository.updateStatus(new Types.ObjectId(id), agencyId, status);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }

  async addSupplierBooking(
    id: string,
    agencyId: Types.ObjectId,
    supplierBooking: Omit<SupplierBookingDTO, "id">
  ): Promise<BookingDTO> {
    const supplierBookingData: SupplierBooking = {
      supplierId: new Types.ObjectId(supplierBooking.supplierId),
      totalCost: supplierBooking.totalCost,
      currency: supplierBooking.currency,
      status: supplierBooking.status,
      ...(supplierBooking.referenceNumber
        ? { referenceNumber: supplierBooking.referenceNumber }
        : {}),
      ...(supplierBooking.checkIn ? { checkIn: new Date(supplierBooking.checkIn) } : {}),
      ...(supplierBooking.checkOut ? { checkOut: new Date(supplierBooking.checkOut) } : {}),
      ...(supplierBooking.guests !== undefined ? { guests: supplierBooking.guests } : {}),
      ...(supplierBooking.rooms !== undefined ? { rooms: supplierBooking.rooms } : {}),
      ...(supplierBooking.documentUrl ? { documentUrl: supplierBooking.documentUrl } : {}),
    };
    const booking = await bookingRepository.addSupplierBooking(
      new Types.ObjectId(id),
      agencyId,
      supplierBookingData
    );
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }

  async updateSupplierBooking(
    id: string,
    agencyId: Types.ObjectId,
    supplierBookingId: string,
    data: Partial<Omit<SupplierBookingDTO, "id">>
  ): Promise<BookingDTO> {
    const updateData: Partial<SupplierBooking> = {};
    if (data.supplierId) updateData.supplierId = new Types.ObjectId(data.supplierId);
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber;
    if (data.checkIn !== undefined) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut !== undefined) updateData.checkOut = new Date(data.checkOut);
    if (data.guests !== undefined) updateData.guests = data.guests;
    if (data.rooms !== undefined) updateData.rooms = data.rooms;
    if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;
    const booking = await bookingRepository.updateSupplierBooking(
      new Types.ObjectId(id),
      agencyId,
      new Types.ObjectId(supplierBookingId),
      updateData
    );
    if (!booking) {
      throw new AppError("Booking or supplier booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }

  async generateVoucher(id: string, agencyId: Types.ObjectId): Promise<BookingDTO> {
    const bookingId = new Types.ObjectId(id);
    const booking = await bookingRepository.findByIdAndAgency(bookingId, agencyId);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const voucherKey = `voucher/${bookingId}`;
    const voucherUrl = `${env.CLIENT_URL}/voucher/${bookingId}`;

    const updated = await bookingRepository.updateVoucher(bookingId, agencyId, voucherUrl, voucherKey);
    if (!updated) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(updated);
  }

  async getPublicVoucher(id: string): Promise<BookingDTO> {
    const booking = await bookingRepository.findById(new Types.ObjectId(id));
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }
}

export const bookingService = new BookingService();