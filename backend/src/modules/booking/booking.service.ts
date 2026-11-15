import { Types } from "mongoose";
import { bookingRepository } from "./booking.repository";
import type { CreateBookingInput, UpdateBookingInput, BookingListQuery, BookingDTO, BookingListResponse } from "./booking.types";
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
    supplierBooking: Omit<BookingDTO["supplierBookings"][0], "id">
  ): Promise<BookingDTO> {
    const booking = await bookingRepository.addSupplierBooking(
      new Types.ObjectId(id),
      agencyId,
      { ...supplierBooking, supplierId: new Types.ObjectId(supplierBooking.supplierId) } as any
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
    data: Partial<BookingDTO["supplierBookings"][0]>
  ): Promise<BookingDTO> {
    const booking = await bookingRepository.updateSupplierBooking(
      new Types.ObjectId(id),
      agencyId,
      new Types.ObjectId(supplierBookingId),
      data as any
    );
    if (!booking) {
      throw new AppError("Booking or supplier booking not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toBookingDTO(booking);
  }
}

export const bookingService = new BookingService();