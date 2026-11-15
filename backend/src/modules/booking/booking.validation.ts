import { z } from "zod";

const TravellerRosterSchema = z.object({
  name: z.string().min(1).max(200),
  passportNumber: z.string().max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

const SupplierBookingInputSchema = z.object({
  supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  referenceNumber: z.string().max(100).optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  guests: z.number().int().min(1).optional(),
  rooms: z.number().int().min(1).optional(),
  totalCost: z.number().min(0),
  currency: z.string().length(3).default("INR"),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
  documentUrl: z.string().url().optional(),
});

export const createBookingSchema = z.object({
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    quotationId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    travellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    travellers: z.array(TravellerRosterSchema).min(1).max(20),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    itineraryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(["enquiry", "quoted", "deposit_paid", "confirmed", "completed", "cancelled", "refunded"]).default("enquiry"),
    totalPrice: z.number().min(0).optional(),
    paidAmount: z.number().min(0).optional(),
    currency: z.string().length(3).default("INR"),
    departureDate: z.string().datetime(),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    supplierBookings: z.array(SupplierBookingInputSchema).max(20).optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    quotationId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    travellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    travellers: z.array(TravellerRosterSchema).min(1).max(20).optional(),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    itineraryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(["enquiry", "quoted", "deposit_paid", "confirmed", "completed", "cancelled", "refunded"]).optional(),
    totalPrice: z.number().min(0).optional(),
    paidAmount: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    departureDate: z.string().datetime().optional(),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    supplierBookings: z.array(SupplierBookingInputSchema).max(20).optional(),
    voucherUrl: z.string().url().optional(),
    voucherKey: z.string().optional(),
  }),
});

export const getBookingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const listBookingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.enum(["enquiry", "quoted", "deposit_paid", "confirmed", "completed", "cancelled", "refunded"]).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    itineraryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    departureFrom: z.string().datetime().optional(),
    departureTo: z.string().datetime().optional(),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "bookingNumber", "totalPrice", "departureDate", "startDate"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const deleteBookingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    status: z.enum(["enquiry", "quoted", "deposit_paid", "confirmed", "completed", "cancelled", "refunded"]),
  }),
});