import { Types } from "mongoose";
import { InvoiceModel } from "./invoice.model";
import type { InvoiceDocument, InvoicePaymentMethod } from "./invoice.model";
import type { InvoiceListQuery } from "./invoice.types";
import { BookingPaymentModel } from "../booking-payment/booking-payment.model";

interface InvoiceLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  invoiceNumber: string;
  type: "proforma" | "tax_invoice" | "receipt";
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: Date;
  paidAmount: number;
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceRepository {
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async create(data: {
    agencyId: Types.ObjectId;
    bookingId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    type: "proforma" | "tax_invoice" | "receipt";
    subtotal: number;
    taxAmount?: number;
    total: number;
    currency?: string;
    gstin?: string;
    taxPercentage?: number;
    dueDate?: Date;
    paidAmount?: number;
    notes?: string;
    termsAndConditions?: string;
  }): Promise<InvoiceDocument> {
    const paidAmount = data.paidAmount || 0;
    const invoice = new InvoiceModel({
      ...data,
      agencyId: data.agencyId,
      bookingId: data.bookingId,
      leadId: data.leadId,
      type: data.type,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount || 0,
      total: data.total,
      currency: data.currency || "INR",
      gstin: data.gstin,
      taxPercentage: data.taxPercentage || 0,
      dueDate: data.dueDate,
      paidAmount,
      status:
        paidAmount <= 0
          ? data.dueDate && data.dueDate.getTime() < Date.now()
            ? "overdue"
            : "unpaid"
          : paidAmount + 0.001 >= data.total
            ? "paid"
            : "partial",
      invoiceNumber: this.generateInvoiceNumber(),
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
    });
    return invoice.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      bookingId: Types.ObjectId;
      leadId: Types.ObjectId;
      type: "proforma" | "tax_invoice" | "receipt";
      status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
      subtotal: number;
      taxAmount: number;
      total: number;
      currency: string;
      gstin: string;
      taxPercentage: number;
      dueDate: Date;
      paidAmount: number;
      pdfUrl: string;
      pdfKey: string;
      paymentLinkUrl: string;
      paymentLinkExpiresAt: Date;
      notes: string;
      termsAndConditions: string;
    }>
  ): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await InvoiceModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: InvoiceListQuery): Promise<{
    items: InvoiceLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, type, status, bookingId, leadId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (bookingId) filter.bookingId = new Types.ObjectId(bookingId);
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      InvoiceModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      InvoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as InvoiceLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listByBookingIds(bookingIds: Types.ObjectId[], query: InvoiceListQuery): Promise<{
    items: InvoiceLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!bookingIds || bookingIds.length === 0) {
      return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
    const { page = 1, limit = 20, search, type, status, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { bookingId: { $in: bookingIds } };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      InvoiceModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      InvoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as InvoiceLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByBookingId(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({ bookingId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await InvoiceModel.aggregate([
      { $match: { agencyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  async getOverdueInvoices(agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({
      agencyId,
      status: { $in: ["unpaid", "partial"] },
      dueDate: { $lt: now },
    }).sort({ dueDate: 1 }).lean().exec();
  }

  async updateStatus(id: Types.ObjectId, agencyId: Types.ObjectId, status: string): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate({ _id: id, agencyId }, { $set: { status } }, { new: true }).exec();
  }

  async addEmbeddedPayment(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    payment: {
      amount: number;
      method: InvoicePaymentMethod;
      transactionId?: string;
      notes?: string;
      paidAt: Date;
      recordedBy?: Types.ObjectId;
    }
  ): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate(
      { _id: id, agencyId },
      { $push: { payments: payment } },
      { new: true }
    ).exec();
  }

  async getLedgerPaidAmount(
    id: Types.ObjectId,
    agencyId: Types.ObjectId
  ): Promise<{ total: number; count: number }> {
    const result = await BookingPaymentModel.aggregate([
      { $match: { invoiceId: id, agencyId } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).exec();
    return { total: result[0]?.total || 0, count: result[0]?.count || 0 };
  }

  async listLedgerPayments(
    id: Types.ObjectId,
    agencyId: Types.ObjectId
  ): Promise<
    Array<{
      amount: number;
      method: InvoicePaymentMethod;
      transactionId?: string;
      notes?: string;
      paidAt: Date;
      recordedBy?: Types.ObjectId;
    }>
  > {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const payments = await BookingPaymentModel.find({ invoiceId: id, agencyId })
      .sort({ paidAt: -1 })
      .lean()
      .exec();
    return payments.map((payment: {
      amount: number;
      method: InvoicePaymentMethod;
      transactionId?: string;
      notes?: string;
      paidAt: Date;
      recordedBy?: Types.ObjectId;
    }) => ({
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId,
      notes: payment.notes,
      paidAt: payment.paidAt,
      recordedBy: payment.recordedBy,
    }));
  }

  async recalculateTotals(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const invoice = await InvoiceModel.findOne({ _id: id, agencyId }).exec();
    if (!invoice) {
      return null;
    }

    const ledger = await this.getLedgerPaidAmount(id, agencyId);
    const embeddedPaid = (invoice.payments ?? []).reduce(
      (sum: number, payment: { amount: number }) => sum + payment.amount,
      0
    );
    const hasLedgerEntries = ledger.count > 0 || (invoice.payments?.length ?? 0) > 0;

    if (hasLedgerEntries) {
      invoice.paidAmount = ledger.total + embeddedPaid;
    }
    if (invoice.status !== "cancelled") {
      const paidAmount = invoice.paidAmount ?? 0;
      const overdue = Boolean(invoice.dueDate && invoice.dueDate.getTime() < Date.now());
      if (paidAmount <= 0) {
        invoice.status = overdue ? "overdue" : "unpaid";
      } else if (paidAmount + 0.001 >= invoice.total) {
        invoice.status = "paid";
      } else {
        invoice.status = overdue ? "overdue" : "partial";
      }
    }

    return invoice.save();
  }
}

export const invoiceRepository = new InvoiceRepository();