import type { BookingDocument, TravellerRoster, SupplierBooking } from "./booking.model";
import type { Types } from "mongoose";

export interface CreateBookingInput {
  leadId?: string;
  quotationId?: string;
  travellerId?: string;
  travellers: Omit<TravellerRoster, "id">[];
  packageId?: string;
  itineraryId?: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  totalPrice?: number;
  paidAmount?: number;
  currency?: string;
  departureDate: string | Date;
  staffId?: string;
  supplierBookings?: Omit<SupplierBooking, "id">[];
}

export interface UpdateBookingInput {
  leadId?: string;
  quotationId?: string;
  travellerId?: string;
  travellers?: Omit<TravellerRoster, "id">[];
  packageId?: string;
  itineraryId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  totalPrice?: number;
  paidAmount?: number;
  currency?: string;
  departureDate?: string | Date;
  staffId?: string;
  supplierBookings?: Omit<SupplierBooking, "id">[];
  voucherUrl?: string;
  voucherKey?: string;
}

export interface BookingListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  leadId?: string;
  packageId?: string;
  itineraryId?: string;
  departureFrom?: string | Date;
  departureTo?: string | Date;
  staffId?: string;
  sortBy?: "createdAt" | "updatedAt" | "bookingNumber" | "totalPrice" | "departureDate" | "startDate";
  sortOrder?: "asc" | "desc";
}

export interface BookingListResponse {
  items: BookingDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierBookingDTO {
  id?: string;
  supplierId: string;
  referenceNumber?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  totalCost: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  documentUrl?: string;
}

export interface BookingDTO {
  id: string;
  agencyId: string;
  leadId?: string;
  quotationId?: string;
  bookingNumber: string;
  travellerId?: string;
  travellers: TravellerRoster[];
  packageId?: string;
  itineraryId?: string;
  startDate: string;
  endDate: string;
  status: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  totalPrice: number;
  paidAmount: number;
  currency: string;
  departureDate: string;
  staffId?: string;
  supplierBookings: SupplierBookingDTO[];
  voucherUrl?: string;
  voucherKey?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  quotationId?: Types.ObjectId;
  bookingNumber: string;
  travellerId?: Types.ObjectId;
  travellers: TravellerRoster[];
  packageId?: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  totalPrice: number;
  paidAmount: number;
  currency: string;
  departureDate: Date;
  staffId?: Types.ObjectId;
  supplierBookings: SupplierBooking[];
  voucherUrl?: string;
  voucherKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toBookingDTO(doc: BookingDocument | BookingLean): BookingDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    leadId: doc.leadId?.toString(),
    quotationId: doc.quotationId?.toString(),
    bookingNumber: doc.bookingNumber,
    travellerId: doc.travellerId?.toString(),
    travellers: doc.travellers,
    packageId: doc.packageId?.toString(),
    itineraryId: doc.itineraryId?.toString(),
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate.toISOString(),
    status: doc.status,
    totalPrice: doc.totalPrice,
    paidAmount: doc.paidAmount,
    currency: doc.currency,
    departureDate: doc.departureDate.toISOString(),
    staffId: doc.staffId?.toString(),
    supplierBookings: (doc.supplierBookings ?? []).map((supplierBooking) => ({
      ...(supplierBooking._id ? { id: String(supplierBooking._id) } : {}),
      supplierId: String(supplierBooking.supplierId),
      ...(supplierBooking.referenceNumber
        ? { referenceNumber: supplierBooking.referenceNumber }
        : {}),
      ...(supplierBooking.checkIn ? { checkIn: supplierBooking.checkIn.toISOString() } : {}),
      ...(supplierBooking.checkOut ? { checkOut: supplierBooking.checkOut.toISOString() } : {}),
      ...(supplierBooking.guests !== undefined ? { guests: supplierBooking.guests } : {}),
      ...(supplierBooking.rooms !== undefined ? { rooms: supplierBooking.rooms } : {}),
      totalCost: supplierBooking.totalCost,
      currency: supplierBooking.currency,
      status: supplierBooking.status,
      ...(supplierBooking.documentUrl ? { documentUrl: supplierBooking.documentUrl } : {}),
    })),
    voucherUrl: doc.voucherUrl,
    voucherKey: doc.voucherKey,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}