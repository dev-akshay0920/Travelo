import { Types } from "mongoose";
import { BookingPaymentModel } from "./booking-payment.model";
import type { BookingPaymentDocument } from "./booking-payment.model";
import type { BookingPaymentListQuery } from "./booking-payment.types";

interface BookingPaymentLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: string;
  method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt: Date;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingPaymentRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    bookingId: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    amount: number;
    currency?: string;
    method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
    transactionId?: string;
    paidAt?: Date;
    notes?: string;
    recordedBy: Types.ObjectId;
  }): Promise<BookingPaymentDocument> {
    const payment = new BookingPaymentModel({
      ...data,
      agencyId: data.agencyId,
      bookingId: data.bookingId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      currency: data.currency || "INR",
      method: data.method,
      transactionId: data.transactionId,
      paidAt: data.paidAt || new Date(),
      notes: data.notes,
      recordedBy: data.recordedBy,
    });
    return payment.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<BookingPaymentDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingPaymentModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      bookingId: Types.ObjectId;
      invoiceId: Types.ObjectId;
      amount: number;
      currency: string;
      method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
      transactionId: string;
      paidAt: Date;
      notes: string;
    }>
  ): Promise<BookingPaymentDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingPaymentModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await BookingPaymentModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: BookingPaymentListQuery): Promise<{
    items: BookingPaymentLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, bookingId, invoiceId, method, paidFrom, paidTo, sortBy = "paidAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (bookingId) filter.bookingId = new Types.ObjectId(bookingId);
    if (invoiceId) filter.invoiceId = new Types.ObjectId(invoiceId);
    if (method) filter.method = method;
    if (paidFrom || paidTo) {
      filter.paidAt = {};
      if (paidFrom) (filter.paidAt as Record<string, Date>).$gte = new Date(paidFrom);
      if (paidTo) (filter.paidAt as Record<string, Date>).$lte = new Date(paidTo);
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      BookingPaymentModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      BookingPaymentModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as BookingPaymentLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByBookingId(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<BookingPaymentLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return BookingPaymentModel.find({ bookingId, agencyId }).sort({ paidAt: -1 }).lean().exec();
  }

  async getTotalPaidForBooking(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<number> {
    const result = await BookingPaymentModel.aggregate([
      { $match: { bookingId, agencyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).exec();
    return result[0]?.total || 0;
  }
}

export const bookingPaymentRepository = new BookingPaymentRepository();