import { Types } from "mongoose";
import { BookingModel } from "./booking.model";
import type { BookingDocument, TravellerRoster, SupplierBooking } from "./booking.model";
import type { BookingListQuery } from "./booking.types";
import { BookingPaymentModel } from "../booking-payment/booking-payment.model";

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

export class BookingRepository {
  private generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK-${timestamp}-${random}`;
  }

  async create(data: {
    agencyId: Types.ObjectId;
    leadId?: Types.ObjectId;
    quotationId?: Types.ObjectId;
    travellerId?: Types.ObjectId;
    travellers: TravellerRoster[];
    packageId?: Types.ObjectId;
    itineraryId?: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status?: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
    totalPrice?: number;
    paidAmount?: number;
    currency?: string;
    departureDate: Date;
    staffId?: Types.ObjectId;
    supplierBookings?: SupplierBooking[];
  }): Promise<BookingDocument> {
    const booking = new BookingModel({
      ...data,
      agencyId: data.agencyId,
      leadId: data.leadId,
      quotationId: data.quotationId,
      travellerId: data.travellerId,
      travellers: data.travellers,
      packageId: data.packageId,
      itineraryId: data.itineraryId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "enquiry",
      totalPrice: data.totalPrice || 0,
      paidAmount: data.paidAmount || 0,
      currency: data.currency || "INR",
      departureDate: data.departureDate,
      staffId: data.staffId,
      supplierBookings: data.supplierBookings || [],
      bookingNumber: this.generateBookingNumber(),
    });
    return booking.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      leadId: Types.ObjectId;
      quotationId: Types.ObjectId;
      travellerId: Types.ObjectId;
      travellers: TravellerRoster[];
      packageId: Types.ObjectId;
      itineraryId: Types.ObjectId;
      startDate: Date;
      endDate: Date;
      status: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
      totalPrice: number;
      paidAmount: number;
      currency: string;
      departureDate: Date;
      staffId: Types.ObjectId;
      supplierBookings: SupplierBooking[];
      voucherUrl: string;
      voucherKey: string;
    }>
  ): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await BookingModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: BookingListQuery): Promise<{
    items: BookingLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      leadId,
      packageId,
      itineraryId,
      departureFrom,
      departureTo,
      staffId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (status) filter.status = status;
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (packageId) filter.packageId = new Types.ObjectId(packageId);
    if (itineraryId) filter.itineraryId = new Types.ObjectId(itineraryId);
    if (staffId) filter.staffId = new Types.ObjectId(staffId);
    if (departureFrom || departureTo) {
      filter.departureDate = {};
      if (departureFrom) (filter.departureDate as Record<string, Date>).$gte = new Date(departureFrom);
      if (departureTo) (filter.departureDate as Record<string, Date>).$lte = new Date(departureTo);
    }
    if (search) {
      filter.$or = [
        { bookingNumber: { $regex: search, $options: "i" } },
        { "travellers.name": { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      BookingModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      BookingModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as BookingLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<BookingLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByQuotationId(quotationId: Types.ObjectId, agencyId: Types.ObjectId): Promise<BookingLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.find({ quotationId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByStatus(agencyId: Types.ObjectId, status: string): Promise<BookingLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.find({ agencyId, status }).sort({ departureDate: 1 }).lean().exec();
  }

  async getUpcomingDepartures(agencyId: Types.ObjectId, days: number = 30): Promise<BookingLean[]> {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.find({
      agencyId,
      status: { $in: ["confirmed", "deposit_paid"] },
      departureDate: { $gte: from, $lte: to },
    }).sort({ departureDate: 1 }).lean().exec();
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await BookingModel.aggregate([
      { $match: { agencyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  async updateStatus(id: Types.ObjectId, agencyId: Types.ObjectId, status: string): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOneAndUpdate({ _id: id, agencyId }, { $set: { status } }, { new: true }).exec();
  }

  async addSupplierBooking(
    bookingId: Types.ObjectId,
    agencyId: Types.ObjectId,
    supplierBooking: SupplierBooking
  ): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOneAndUpdate(
      { _id: bookingId, agencyId },
      { $push: { supplierBookings: supplierBooking } },
      { new: true }
    ).exec();
  }

  async findById(id: Types.ObjectId): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findById(id).exec();
  }

  async recalculatePaidAmount(
    bookingId: Types.ObjectId,
    agencyId: Types.ObjectId
  ): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const booking = await BookingModel.findOne({ _id: bookingId, agencyId }).exec();
    if (!booking) {
      return null;
    }

    const ledger = await BookingPaymentModel.aggregate([
      { $match: { bookingId, agencyId } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).exec();
    const paidAmount = ledger[0]?.total || 0;

    if (ledger[0]?.count) {
      booking.paidAmount = paidAmount;
    }

    if (!["cancelled", "refunded", "completed"].includes(booking.status)) {
      if (paidAmount <= 0) {
        if (booking.status === "deposit_paid") {
          booking.status = "quoted";
        }
      } else if (booking.totalPrice > 0 && paidAmount + 0.001 >= booking.totalPrice) {
        if (
          booking.status === "enquiry" ||
          booking.status === "quoted" ||
          booking.status === "deposit_paid"
        ) {
          booking.status = "confirmed";
        }
      } else if (booking.status === "enquiry" || booking.status === "quoted") {
        booking.status = "deposit_paid";
      }
    }

    return booking.save();
  }

  async updateVoucher(
    bookingId: Types.ObjectId,
    agencyId: Types.ObjectId,
    voucherUrl: string,
    voucherKey: string
  ): Promise<BookingDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOneAndUpdate(
      { _id: bookingId, agencyId },
      { $set: { voucherUrl, voucherKey } },
      { new: true }
    ).exec();
  }

  async updateSupplierBooking(
    bookingId: Types.ObjectId,
    agencyId: Types.ObjectId,
    supplierBookingId: Types.ObjectId,
    data: Partial<SupplierBooking>
  ): Promise<BookingDocument | null> {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates[`supplierBookings.$.${key}`] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      return this.findByIdAndAgency(bookingId, agencyId);
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingModel.findOneAndUpdate(
      { _id: bookingId, agencyId, "supplierBookings._id": supplierBookingId },
      { $set: updates },
      { new: true }
    ).exec();
  }
}

export const bookingRepository = new BookingRepository();